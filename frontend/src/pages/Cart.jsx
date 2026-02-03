import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';
import { Trash2, CreditCard, Calendar, Truck, CheckCircle } from 'lucide-react';

const Cart = () => {
  // SÉCURITÉ : On donne une valeur par défaut à 'cart' et 'total'
  const { cart = [], removeFromCart, clearCart, total = 0 } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentTerm, setPaymentTerm] = useState('pay_now'); 

  // LOGIQUE B2B SÉCURISÉE (On vérifie que total existe)
  const safeTotal = total || 0;
  const discount = paymentTerm === 'pay_now' ? safeTotal * 0.02 : 0;
  const finalTotal = safeTotal - discount;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // 1. Grouper par fournisseur
      const itemsBySupplier = cart.reduce((acc, item) => {
        if (!acc[item.supplier_id]) acc[item.supplier_id] = [];
        acc[item.supplier_id].push(item);
        return acc;
      }, {});

      // SI PAIEMENT STRIPE
      if (paymentTerm === 'pay_now') {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/api/create-checkout-session`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, userId: user.id, userEmail: user.email })
        });
        const { url, error } = await response.json();
        if (error) throw new Error(error);
        window.location.href = url;
        return;
      }

      // SI PAIEMENT DIFFÉRÉ (Net 30 / COD)
      for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
        const supplierTotal = items.reduce((sum, i) => sum + (i.price || 0), 0);
        const { data: order, error } = await supabase.from('orders').insert([{
            buyer_id: user.id,
            supplier_id: supplierId,
            total_amount: supplierTotal,
            status: 'pending',
            payment_term: paymentTerm,
            payment_status: 'pending'
        }]).select().single();
        
        if (error) throw error;

        for (const item of items) {
            await supabase.from('order_items').insert([{
                order_id: order.id,
                product_id: item.id,
                quantity: 1,
                price_at_purchase: item.price
            }]);
            // Maj stock
            const { data: currentProd } = await supabase.from('products').select('stock').eq('id', item.id).single();
            if (currentProd) await supabase.from('products').update({ stock: currentProd.stock - 1 }).eq('id', item.id);
        }
      }
      alert("Commandes envoyées !");
      clearCart();
      navigate('/merchant');

    } catch (error) {
      console.error(error);
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="text-2xl font-bold text-slate-800">Panier vide</h2>
      <button onClick={() => navigate('/merchant')} className="mt-4 text-emerald-600 font-bold hover:underline">Retourner au marché</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Finaliser la commande</h1>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-lg mb-4">Articles</h2>
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-slate-100 last:border-0 py-4">
                  <div><h3 className="font-bold text-slate-800">{item.name}</h3><p className="text-sm text-slate-500">{item.producer}</p></div>
                  <div className="flex items-center gap-4"><span className="font-mono font-bold">{(item.price || 0).toFixed(2)}$</span><button onClick={() => removeFromCart(item.id)} className="text-red-400"><Trash2 size={18}/></button></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-lg mb-4">Paiement</h2>
              <div className="grid gap-3">
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition ${paymentTerm === 'pay_now' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3"><input type="radio" name="payment" checked={paymentTerm === 'pay_now'} onChange={() => setPaymentTerm('pay_now')} className="text-emerald-600"/><div><span className="font-bold block flex items-center gap-2"><CreditCard size={16}/> Paiement Immédiat</span><span className="text-xs text-emerald-600 font-bold">Escompte 2%</span></div></div>
                  <span className="font-bold">-{ (safeTotal * 0.02).toFixed(2) }$</span>
                </label>
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition ${paymentTerm === 'net30' ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3"><input type="radio" name="payment" checked={paymentTerm === 'net30'} onChange={() => setPaymentTerm('net30')} className="text-blue-600"/><div><span className="font-bold block flex items-center gap-2"><Calendar size={16}/> Net 30 Jours</span></div></div>
                </label>
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition ${paymentTerm === 'on_delivery' ? 'border-amber-500 bg-amber-50' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3"><input type="radio" name="payment" checked={paymentTerm === 'on_delivery'} onChange={() => setPaymentTerm('on_delivery')} className="text-amber-600"/><div><span className="font-bold block flex items-center gap-2"><Truck size={16}/> COD (Livraison)</span></div></div>
                </label>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-8">
            <h2 className="font-bold text-xl mb-6">Résumé</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-slate-500"><span>Sous-total</span><span>{safeTotal.toFixed(2)}$</span></div>
              {paymentTerm === 'pay_now' && <div className="flex justify-between text-emerald-600 font-bold"><span>Escompte (2%)</span><span>- {discount.toFixed(2)}$</span></div>}
              <div className="flex justify-between text-slate-500"><span>Taxes (14.975%)</span><span>{(finalTotal * 0.14975).toFixed(2)}$</span></div>
              <div className="border-t pt-3 flex justify-between text-lg font-black text-slate-900"><span>Total</span><span>{(finalTotal * 1.14975).toFixed(2)}$</span></div>
            </div>
            <button onClick={handleCheckout} disabled={loading} className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2">{loading ? '...' : <><CheckCircle size={20}/> Confirmer</>}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

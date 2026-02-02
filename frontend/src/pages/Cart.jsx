import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';
import { Trash2, CreditCard, Calendar, Truck, CheckCircle } from 'lucide-react';

const Cart = () => {
  const { cart, removeFromCart, clearCart, total } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentTerm, setPaymentTerm] = useState('pay_now'); // pay_now, net30, on_delivery

  // --- LOGIQUE B2B : ESCOMPTE ---
  const discount = paymentTerm === 'pay_now' ? total * 0.02 : 0; // 2% si paiement immédiat
  const finalTotal = total - discount;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // 1. Grouper par fournisseur (Une commande par fournisseur)
      const itemsBySupplier = cart.reduce((acc, item) => {
        if (!acc[item.supplier_id]) acc[item.supplier_id] = [];
        acc[item.supplier_id].push(item);
        return acc;
      }, {});

      for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
        // Calcul du total pour ce fournisseur spécifique
        const supplierTotal = items.reduce((sum, i) => sum + (i.price * 1), 0);
        const supplierDiscount = paymentTerm === 'pay_now' ? supplierTotal * 0.02 : 0;

        // 2. Créer la commande
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([{
            buyer_id: user.id,
            supplier_id: supplierId,
            total_amount: supplierTotal - supplierDiscount,
            status: 'pending',
            payment_term: paymentTerm,
            payment_status: paymentTerm === 'pay_now' ? 'paid' : 'pending'
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        // 3. Insérer les articles ET diminuer le stock
        for (const item of items) {
          await supabase.from('order_items').insert([{
            order_id: order.id,
            product_id: item.id,
            quantity: 1, // Pour simplifier ici, on suppose qté 1 par ligne dans le panier
            price_at_purchase: item.price
          }]);

          // DIMINUTION DU STOCK (Magie ici !)
          // On fait un update simple du stock
          const { data: currentProd } = await supabase.from('products').select('stock').eq('id', item.id).single();
          if (currentProd) {
             await supabase.from('products').update({ stock: currentProd.stock - 1 }).eq('id', item.id);
          }
        }
      }

      alert("Commandes envoyées aux fournisseurs ! 🚀");
      clearCart();
      navigate('/merchant'); // Retour tableau de bord acheteur

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
      <h2 className="text-2xl font-bold text-slate-800">Votre panier est vide</h2>
      <button onClick={() => navigate('/merchant')} className="mt-4 text-emerald-600 font-bold hover:underline">Retourner au marché</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Finaliser la commande</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* LISTE DES ARTICLES */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-lg mb-4">Articles ({cart.length})</h2>
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-slate-100 last:border-0 py-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    <p className="text-sm text-slate-500">Fournisseur : {item.producer || 'Standard'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold">{item.price}$</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>

            {/* OPTIONS DE PAIEMENT (Le WOW Factor B2B) */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-lg mb-4">Modalités de paiement</h2>
              <div className="grid gap-3">
                
                {/* Option 1: Pay Now */}
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition ${paymentTerm === 'pay_now' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" className="w-5 h-5 text-emerald-600" checked={paymentTerm === 'pay_now'} onChange={() => setPaymentTerm('pay_now')} />
                    <div>
                      <span className="font-bold block flex items-center gap-2"><CreditCard size={16}/> Paiement Immédiat</span>
                      <span className="text-xs text-emerald-600 font-bold">Escompte de 2% appliqué ✅</span>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">-{ (total * 0.02).toFixed(2) }$</span>
                </label>

                {/* Option 2: Net 30 */}
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition ${paymentTerm === 'net30' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" className="w-5 h-5 text-blue-600" checked={paymentTerm === 'net30'} onChange={() => setPaymentTerm('net30')} />
                    <div>
                      <span className="font-bold block flex items-center gap-2"><Calendar size={16}/> Net 30 Jours</span>
                      <span className="text-xs text-slate-500">Paiement sur facture. Crédit approuvé.</span>
                    </div>
                  </div>
                </label>

                {/* Option 3: COD */}
                <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition ${paymentTerm === 'on_delivery' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" className="w-5 h-5 text-amber-600" checked={paymentTerm === 'on_delivery'} onChange={() => setPaymentTerm('on_delivery')} />
                    <div>
                      <span className="font-bold block flex items-center gap-2"><Truck size={16}/> À la réception (COD)</span>
                      <span className="text-xs text-slate-500">Chèque ou comptant à la livraison.</span>
                    </div>
                  </div>
                </label>

              </div>
            </div>
          </div>

          {/* RÉSUMÉ TOTAL */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-8">
            <h2 className="font-bold text-xl mb-6">Résumé</h2>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-slate-500"><span>Sous-total</span><span>{total.toFixed(2)}$</span></div>
              {paymentTerm === 'pay_now' && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Escompte (2%)</span><span>- {discount.toFixed(2)}$</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500"><span>Taxes (QC - 14.975%)</span><span>{(finalTotal * 0.14975).toFixed(2)}$</span></div>
              <div className="border-t pt-3 flex justify-between text-lg font-black text-slate-900">
                <span>Total</span><span>{(finalTotal * 1.14975).toFixed(2)}$</span>
              </div>
            </div>
            <button onClick={handleCheckout} disabled={loading} className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl transition transform hover:scale-[1.02] flex justify-center items-center gap-2">
              {loading ? 'Traitement...' : <><CheckCircle size={20}/> Confirmer la commande</>}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">Transactions sécurisées par Forfeo B2B.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

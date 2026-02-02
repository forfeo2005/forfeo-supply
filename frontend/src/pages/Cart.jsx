import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    // 1. Récupérer l'utilisateur connecté (L'acheteur)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');

    try {
      // On groupe les produits par fournisseur (Une commande par fournisseur)
      // C'est nécessaire car chaque fournisseur recevra sa propre commande
      const itemsBySupplier = cart.reduce((acc, item) => {
        if (!acc[item.supplier_id]) acc[item.supplier_id] = [];
        acc[item.supplier_id].push(item);
        return acc;
      }, {});

      // Pour chaque fournisseur, on crée une commande
      for (const supplierId in itemsBySupplier) {
        const items = itemsBySupplier[supplierId];
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // A. Créer la commande dans 'orders'
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([{
            buyer_id: user.id,
            supplier_id: supplierId,
            total_amount: totalAmount,
            status: 'pending'
          }])
          .select()
          .single();

        if (orderError) throw orderError;

        // B. Ajouter les articles dans 'order_items'
        const orderItems = items.map(item => ({
          order_id: orderData.id,
          product_id: item.id,
          quantity: item.quantity,
          price_at_purchase: item.price
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // Tout s'est bien passé
      alert("✅ Commande envoyée avec succès aux fournisseurs !");
      clearCart(); // On vide le panier
      navigate('/merchant'); // Retour au dashboard

    } catch (error) {
      console.error(error);
      alert("Erreur lors de la commande : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-slate-900">Votre panier est vide</h2>
        <button onClick={() => navigate('/merchant')} className="mt-6 text-forfeo-600 font-bold hover:underline">
          Retourner au catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Votre Panier</h1>
        
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
          <div className="p-6 space-y-6">
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between border-b border-slate-50 pb-6 last:pb-0 last:border-0">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500">Fournisseur : {item.producer}</p>
                  <p className="text-sm text-slate-500">{item.price} $ / {item.unit}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-slate-50">-</button>
                    <span className="px-3 font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-slate-50">+</button>
                  </div>
                  <div className="font-mono font-bold w-24 text-right">
                    {(item.price * item.quantity).toFixed(2)} $
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-xl">
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-50 p-6 flex justify-between items-center">
            <div className="text-sm text-slate-500">Total hors taxes</div>
            <div className="text-3xl font-bold text-slate-900">{cartTotal} $</div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button onClick={() => navigate('/merchant')} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800">
            Continuer mes achats
          </button>
          <button 
            onClick={handleCheckout} 
            disabled={loading}
            className="bg-forfeo-600 hover:bg-forfeo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Traitement...' : 'Valider la commande'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;

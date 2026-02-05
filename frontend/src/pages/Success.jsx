// frontend/src/pages/Success.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';
import { CheckCircle, ArrowRight } from 'lucide-react';

// Même clé que dans Cart.jsx
const CHECKOUT_STORAGE_KEY = 'forfeo_last_checkout';
const isBrowser = typeof window !== 'undefined';

const Success = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    // On vide le panier local (ce que tu faisais déjà)
    clearCart();

    // Puis on essaie de synchroniser la commande payée avec Supabase
    const syncPaidCheckoutToOrders = async () => {
      if (!isBrowser) return;

      const raw = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (!raw) return; // rien à synchroniser

      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (e) {
        console.warn('⚠️ Impossible de parser forfeo_last_checkout', e);
        window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
        return;
      }

      // On vérifie que c’est bien un checkout pay_now avec un panier
      if (
        !payload ||
        payload.paymentTerm !== 'pay_now' ||
        !Array.isArray(payload.cart) ||
        payload.cart.length === 0
      ) {
        window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
        return;
      }

      try {
        // On récupère l’utilisateur courant (si encore connecté)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const buyerId = user?.id ?? payload.userId;
        if (!buyerId) {
          console.warn(
            "⚠️ Impossible de créer les commandes payées : aucun buyerId disponible."
          );
          window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
          return;
        }

        const cart = payload.cart;

        // Regroupement par fournisseur, comme pour Net30 / COD
        const itemsBySupplier = cart.reduce((acc, item) => {
          const supplierKey = item.supplier_id ?? 'unknown_supplier';
          if (!acc[supplierKey]) acc[supplierKey] = [];
          acc[supplierKey].push(item);
          return acc;
        }, {});

        // Pour chaque fournisseur, on crée une commande + ses lignes
        for (const [supplierId, items] of Object.entries(
          itemsBySupplier
        )) {
          const supplierTotal = items.reduce((sum, i) => {
            const price = Number(i.price) || 0;
            const qty = Number(i.quantity) || 1;
            return sum + price * qty;
          }, 0);

          const { data: order, error } = await supabase
            .from('orders')
            .insert([
              {
                buyer_id: buyerId,
                supplier_id:
                  supplierId === 'unknown_supplier'
                    ? null
                    : supplierId,
                total_amount: supplierTotal,
                status: 'confirmed',        // 💳 commande payée
                payment_term: 'pay_now',    // même logique que dans Cart.jsx
                payment_status: 'paid',
              },
            ])
            .select()
            .single();

          if (error) {
            console.error(
              '❌ Erreur création order pay_now:',
              error
            );
            continue; // on tente quand même les autres fournisseurs
          }

          // Lignes de commande + mise à jour des stocks
          for (const item of items) {
            const qty = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;

            // order_items
            const { error: itemErr } = await supabase
              .from('order_items')
              .insert([
                {
                  order_id: order.id,
                  product_id: item.id,
                  quantity: qty,
                  price_at_purchase: price,
                },
              ]);

            if (itemErr) {
              console.error(
                '❌ Erreur création order_item pay_now:',
                itemErr
              );
              continue;
            }

            // Maj stock produit
            const {
              data: currentProd,
              error: stockErr,
            } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.id)
              .single();

            if (stockErr) {
              console.error(
                '⚠️ Erreur lecture stock produit pay_now:',
                stockErr
              );
              continue;
            }

            if (currentProd) {
              const currentStock = Number(currentProd.stock) || 0;
              const newStock = Math.max(0, currentStock - qty);

              const { error: updErr } = await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.id);

              if (updErr) {
                console.error(
                  '⚠️ Erreur mise à jour stock pay_now:',
                  updErr
                );
              }
            }
          }
        }
      } catch (err) {
        console.error(
          '❌ Erreur globale sync checkout pay_now:',
          err
        );
      } finally {
        // Quoi qu’il arrive, on nettoie la clé pour éviter les doublons
        try {
          window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
        } catch (e) {
          console.warn(
            '⚠️ Impossible de supprimer forfeo_last_checkout',
            e
          );
        }
      }
    };

    // On lance la synchro (fire & forget)
    syncPaidCheckoutToOrders();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Paiement Réussi !
        </h1>
        <p className="text-slate-500 mb-8">
          Merci pour votre confiance. Votre commande a été transmise au(x){' '}
          fournisseur(s). Vous avez reçu une confirmation par courriel.
        </p>
        <button
          onClick={() => navigate('/merchant')}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2"
          type="button"
        >
          Retour au marché <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Success;

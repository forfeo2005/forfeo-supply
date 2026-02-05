// frontend/src/pages/Cart.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabase';
import {
  Trash2,
  CreditCard,
  Calendar,
  Truck,
  CheckCircle,
  Minus,
  Plus,
} from 'lucide-react';

// ✅ Base URL des Edge Functions Supabase
// On se base directement sur VITE_SUPABASE_URL : https://xxx.supabase.co/functions/v1
const FUNCTIONS_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

// ✅ Clé publique Supabase (anon) – utilisée comme apikey
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const Cart = () => {
  // ✅ Panier B2B : on réutilise exactement ton contexte
  const {
    cart = [],
    removeFromCart,
    clearCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentTerm, setPaymentTerm] = useState('pay_now');

  // ✅ Total sécurisé (cartTotal est une string dans le contexte)
  const safeTotal = useMemo(() => {
    const n = Number(cartTotal);
    if (Number.isFinite(n)) return n;
    // fallback: recalcule à partir du panier
    return cart.reduce(
      (acc, item) =>
        acc +
        (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, [cartTotal, cart]);

  const discount = paymentTerm === 'pay_now' ? safeTotal * 0.02 : 0;
  const finalTotal = safeTotal - discount;

  // Taxes QC (conservé)
  const taxRate = 0.14975;
  const taxes = finalTotal * taxRate;
  const grandTotal = finalTotal + taxes;

  // Nombre total d’articles (vue B2B claire)
  const totalItems = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + (Number(item.quantity) || 1),
        0
      ),
    [cart]
  );

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // ✅ Grouper par fournisseur (avec fallback si supplier_id absent)
      const itemsBySupplier = cart.reduce((acc, item) => {
        const supplierKey = item.supplier_id ?? 'unknown_supplier';
        if (!acc[supplierKey]) acc[supplierKey] = [];
        acc[supplierKey].push(item);
        return acc;
      }, {});

      // --- PAIEMENT IMMÉDIAT (STRIPE via EDGE FUNCTION) ---
      if (paymentTerm === 'pay_now') {
        // 1) Récupérer le JWT utilisateur pour Authorization
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Erreur getSession Supabase:', sessionError);
          throw new Error("Impossible de récupérer la session d'authentification.");
        }

        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) {
          throw new Error(
            "Impossible de récupérer le jeton d'authentification (access_token)."
          );
        }

        const endpoint = `${FUNCTIONS_BASE_URL}/create-checkout-session`;
        console.log('📡 Appel Edge Function Stripe ->', endpoint);

        let response;
        let raw = '';

        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: SUPABASE_ANON_KEY, // requis par Supabase Functions
              Authorization: `Bearer ${accessToken}`, // ✅ JWT utilisateur
            },
            body: JSON.stringify({
              cart,
              userId: user.id,
              userEmail: user.email,
            }),
          });
        } catch (networkError) {
          console.error(
            '❌ Erreur réseau vers la Edge Function Stripe:',
            networkError
          );
          throw new Error(
            "Impossible de contacter le serveur de paiement. Vérifie que l'Edge Function est bien déployée."
          );
        }

        try {
          raw = await response.text();
        } catch (e) {
          console.error('❌ Impossible de lire la réponse brute du backend:', e);
        }

        console.log(
          '🔍 Réponse brute Edge Function Stripe:',
          response?.status,
          response?.statusText,
          raw
        );

        let data = null;
        if (raw) {
          try {
            data = JSON.parse(raw);
          } catch (e) {
            console.error('⚠️ JSON invalide renvoyé par la Edge Function:', raw);
          }
        }

        if (!response.ok) {
          const message =
            (data && data.error) ||
            (response.status === 401
              ? "Erreur d'authentification sur la fonction de paiement (HTTP 401). Vérifie que le JWT est bien accepté dans Supabase."
              : `Erreur serveur paiement (HTTP ${response.status || '???'}).`);
          throw new Error(message);
        }

        if (!data || !data.url) {
          console.error('⚠️ Réponse JSON inattendue :', data);
          throw new Error(
            "La réponse du serveur de paiement est incomplète (pas d'URL de redirection)."
          );
        }

        // ✅ Tout est bon : on redirige vers Stripe
        window.location.href = data.url;
        return;
      }

      // --- PAIEMENT DIFFÉRÉ (Net 30 / COD) ---
      for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
        // ✅ Total fournisseur = somme (price * quantity)
        const supplierTotal = items.reduce((sum, i) => {
          const price = Number(i.price) || 0;
          const qty = Number(i.quantity) || 1;
          return sum + price * qty;
        }, 0);

        const { data: order, error } = await supabase
          .from('orders')
          .insert([
            {
              buyer_id: user.id,
              supplier_id:
                supplierId === 'unknown_supplier'
                  ? null
                  : supplierId,
              total_amount: supplierTotal,
              status: 'pending',
              payment_term: paymentTerm,
              payment_status: 'pending',
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // ✅ Créer les items + maj stock en tenant compte de quantity
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

          if (itemErr) throw itemErr;

          // Maj stock (simple, comme ton code, mais avec qty)
          const {
            data: currentProd,
            error: stockErr,
          } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.id)
            .single();

          if (stockErr) throw stockErr;

          if (currentProd) {
            const currentStock = Number(currentProd.stock) || 0;
            const newStock = Math.max(0, currentStock - qty);

            const { error: updErr } = await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.id);

            if (updErr) throw updErr;
          }
        }
      }

      alert('Commandes envoyées aux fournisseurs !');
      clearCart();
      navigate('/merchant');
    } catch (error) {
      console.error(error);
      alert('Erreur: ' + (error?.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  // --- ÉTAT PANIER VIDE ---
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-extrabold text-slate-800">
          Panier vide
        </h2>
        <button
          onClick={() => navigate('/market')}
          className="mt-4 text-emerald-600 font-extrabold hover:underline"
          type="button"
        >
          Retourner au marché
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* En-tête B2B clair */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Finaliser la commande
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              Panier entreprise&nbsp;:{' '}
              <span className="font-semibold text-slate-800">
                {totalItems} article
                {totalItems > 1 ? 's' : ''} auprès de vos fournisseurs.
              </span>
            </p>
            <p className="text-slate-400 mt-1 text-xs sm:text-sm">
              Vérifiez vos lignes, choisissez vos modalités de paiement
              B2B, puis confirmez la commande.
            </p>
          </div>

          <Link
            to="/market"
            className="text-sm font-extrabold px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 transition w-fit"
          >
            Continuer mes achats
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* COLONNE GAUCHE : Articles + Paiement */}
          <div className="md:col-span-2 space-y-4">
            {/* Articles */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-lg">
                  Articles du panier
                </h2>
                <button
                  onClick={clearCart}
                  className="text-sm font-extrabold text-slate-500 hover:text-red-600 transition"
                  type="button"
                >
                  Vider le panier
                </button>
              </div>

              {cart.map((item, idx) => {
                const price = Number(item.price) || 0;
                const qty = Number(item.quantity) || 1;
                const lineTotal = price * qty;

                return (
                  <div
                    key={item.id ?? idx}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-100 last:border-0 py-4 gap-3"
                  >
                    <div>
                      <h3 className="font-extrabold text-slate-800">
                        {item.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Par {item.producer || 'Fournisseur local'}
                      </p>
                      {item.supplier_id && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          ID fournisseur : {item.supplier_id}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {/* Quantité : contrôle simple pour l’acheteur */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                        <button
                          type="button"
                          className="p-1 rounded-lg hover:bg-slate-100 transition"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, qty - 1)
                            )
                          }
                          aria-label="Diminuer la quantité"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="w-7 text-center font-extrabold text-slate-800">
                          {qty}
                        </span>

                        <button
                          type="button"
                          className="p-1 rounded-lg hover:bg-slate-100 transition"
                          onClick={() =>
                            updateQuantity(item.id, qty + 1)
                          }
                          aria-label="Augmenter la quantité"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-extrabold text-slate-900">
                          {lineTotal.toFixed(2)}$
                        </div>
                        <div className="text-xs text-slate-400">
                          {price.toFixed(2)}$ / unité
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-600 transition"
                        type="button"
                        aria-label={`Retirer ${item.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paiement */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-extrabold text-lg mb-4">
                Modalités de paiement B2B
              </h2>

              <div className="grid gap-3">
                {/* Paiement immédiat */}
                <label
                  className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition ${
                    paymentTerm === 'pay_now'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentTerm === 'pay_now'}
                      onChange={() => setPaymentTerm('pay_now')}
                      className="text-emerald-600"
                    />
                    <div>
                      <span className="font-extrabold block flex items-center gap-2">
                        <CreditCard size={16} /> Paiement immédiat
                        (carte)
                      </span>
                      <span className="text-xs text-emerald-600 font-extrabold">
                        Escompte 2% sur la commande
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Votre paiement est traité via Stripe et la
                        commande est directement confirmée auprès des
                        fournisseurs.
                      </p>
                    </div>
                  </div>

                  <span className="font-extrabold text-emerald-700">
                    -{(safeTotal * 0.02).toFixed(2)}$
                  </span>
                </label>

                {/* Net 30 */}
                <label
                  className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition ${
                    paymentTerm === 'net30'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentTerm === 'net30'}
                      onChange={() => setPaymentTerm('net30')}
                      className="text-blue-600"
                    />
                    <div>
                      <span className="font-extrabold block flex items-center gap-2">
                        <Calendar size={16} /> Net 30 jours
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        Facture payable à 30 jours, selon vos ententes
                        avec les fournisseurs.
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Idéal pour les entreprises qui gèrent leur
                        trésorerie avec des conditions de paiement
                        différé.
                      </p>
                    </div>
                  </div>
                </label>

                {/* COD */}
                <label
                  className={`cursor-pointer border-2 rounded-xl p-4 flex items-center justify-between transition ${
                    paymentTerm === 'on_delivery'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentTerm === 'on_delivery'}
                      onChange={() => setPaymentTerm('on_delivery')}
                      className="text-amber-600"
                    />
                    <div>
                      <span className="font-extrabold block flex items-center gap-2">
                        <Truck size={16} /> COD (paiement à la
                        livraison)
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        Paiement directement à la réception de la
                        marchandise (si accepté par le fournisseur).
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Une option simple pour certaines livraisons
                        locales.
                      </p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Petit encadré explicatif B2B */}
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-700 mb-1">
                  Comment cela fonctionne côté fournisseurs&nbsp;?
                </p>
                <p>
                  Forfeo Supply transmet vos commandes aux fournisseurs
                  concernés. Pour le paiement immédiat, la transaction
                  est réglée en ligne. Pour le Net 30 et le COD, la
                  facturation et l&apos;encaissement suivent vos ententes
                  B2B avec les fournisseurs.
                </p>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : Résumé */}
          <div className="bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-8">
            <h2 className="font-extrabold text-xl mb-6">Résumé</h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-slate-500">
                <span>
                  Sous-total ({totalItems} article
                  {totalItems > 1 ? 's' : ''})
                </span>
                <span>{safeTotal.toFixed(2)}$</span>
              </div>

              {paymentTerm === 'pay_now' && (
                <div className="flex justify-between text-emerald-600 font-extrabold">
                  <span>Escompte (2%)</span>
                  <span>- {discount.toFixed(2)}$</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500">
                <span>Taxes (14,975%)</span>
                <span>{taxes.toFixed(2)}$</span>
              </div>

              <div className="border-t pt-3 flex justify-between text-lg font-black text-slate-900">
                <span>Total à payer</span>
                <span>{grandTotal.toFixed(2)}$</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-xl font-extrabold flex justify-center items-center gap-2 transition"
              type="button"
            >
              {loading ? (
                'Traitement en cours...'
              ) : (
                <>
                  <CheckCircle size={20} /> Confirmer la commande
                </>
              )}
            </button>

            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              En confirmant, vous autorisez Forfeo Supply à transmettre
              votre commande aux fournisseurs concernés selon la
              modalité de paiement sélectionnée. Une confirmation et/ou
              facture vous sera transmise selon le mode choisi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

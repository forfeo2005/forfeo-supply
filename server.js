import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import Stripe from 'stripe';
import sgMail from '@sendgrid/mail';

// Configuration du serveur
const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialisation des services tiers
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Connexion Supabase (Backend)
// Note: On utilise SUPABASE_SERVICE_KEY ici pour avoir les droits d'écriture via le Webhook
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- MIDDLEWARE SPÉCIAL ---
// Le Webhook Stripe a besoin du corps "brut" (raw), les autres routes du JSON.
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(cors({ origin: '*' }));

// --- FONCTION UTILITAIRE : ENVOI EMAIL SENDGRID ---
const sendOrderEmail = async (toEmail, orderId, supplierName, amount) => {
  const msg = {
    to: toEmail,
    from: 'ton-email-verifie-sendgrid@example.com', // ⚠️ À remplacer par ton email validé SendGrid
    subject: `Confirmation de commande #${orderId.toString().slice(0, 8)} - Forfeo`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="color: #059669;">Paiement confirmé !</h1>
        <p>Merci pour votre commande sur Forfeo Market.</p>
        <hr style="border: 1px solid #eee;">
        <p><strong>Commande :</strong> #${orderId}</p>
        <p><strong>Fournisseur :</strong> ${supplierName}</p>
        <p><strong>Montant payé :</strong> ${amount.toFixed(2)}$ CAD</p>
        <br>
        <p>Le fournisseur a été notifié et prépare votre expédition.</p>
      </div>
    `,
  };
  try {
    await sgMail.send(msg);
    console.log('📧 Email envoyé à', toEmail);
  } catch (error) {
    console.error('❌ Erreur SendGrid:', error);
  }
};

// --- API 1 : CRÉER SESSION DE PAIEMENT (STRIPE) ---
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { cart, userId, userEmail } = req.body;
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Panier vide' });
    }

    // On prépare une version "compacte" du panier pour la metadata Stripe
    const cartMinimal = cart.map((item) => ({
      id: item.id,
      supplier_id: item.supplier_id ?? null,
      producer: item.producer || 'Fournisseur',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image_url: item.image_url && item.image_url !== 'default' ? item.image_url : null,
      name: item.name || 'Produit',
    }));

    // Articles pour Stripe (prix en cents + quantité)
    const line_items = cartMinimal
      .map((item) => {
        const qty = item.quantity > 0 ? item.quantity : 1;
        const unitAmount = Math.round(item.price * 100);

        return {
          price_data: {
            currency: 'cad',
            product_data: {
              name: item.name,
              description: `Vendu par ${item.producer}`,
              images: item.image_url ? [item.image_url] : [],
            },
            unit_amount: unitAmount,
          },
          quantity: qty,
        };
      })
      .filter((li) => li.price_data.unit_amount > 0);

    if (line_items.length === 0) {
      return res.status(400).json({ error: 'Montants invalides dans le panier' });
    }

    const first = cartMinimal[0];

    // ✅ On passe le panier complet dans metadata (multi-fournisseurs + quantités)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/cart`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        cartJson: JSON.stringify(cartMinimal),

        // Champs legacy pour compat ancienne logique (fallback webhook)
        supplierId: first.supplier_id ?? '',
        supplierName: first.producer || 'Fournisseur',
        productIds: JSON.stringify(cartMinimal.map((c) => c.id)),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe Session:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- API 2 : WEBHOOK STRIPE (Sécurité & Enregistrement Commande) ---
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Traitement du paiement réussi
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const customerEmail = session.customer_details?.email || '';
    const amount = (session.amount_total || 0) / 100;
    const userId = metadata.userId || null;

    console.log(`💰 Paiement reçu pour ${customerEmail} (total Stripe: ${amount.toFixed(2)}$)`);

    // ✅ NOUVELLE LOGIQUE : si on a cartJson, on gère multi-fournisseurs+quantités
    if (metadata.cartJson) {
      let cart = [];
      try {
        cart = JSON.parse(metadata.cartJson);
      } catch (e) {
        console.error('❌ Impossible de parser cartJson dans metadata:', e);
      }

      if (Array.isArray(cart) && cart.length > 0) {
        // Groupage par fournisseur
        const itemsBySupplier = cart.reduce((acc, item) => {
          const supplierKey = item.supplier_id ?? 'unknown_supplier';
          if (!acc[supplierKey]) acc[supplierKey] = [];
          acc[supplierKey].push(item);
          return acc;
        }, {});

        for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
          const supplierAmount = items.reduce((sum, item) => {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 1;
            return sum + price * qty;
          }, 0);

          const supplierName =
            items[0]?.producer || metadata.supplierName || 'Fournisseur';

          const { data: order, error } = await supabase
            .from('orders')
            .insert([
              {
                buyer_id: userId,
                supplier_id: supplierId === 'unknown_supplier' ? null : supplierId,
                total_amount: supplierAmount,
                status: 'pending',
                payment_term: 'pay_now',
                payment_status: 'paid',
              },
            ])
            .select()
            .single();

          if (error || !order) {
            console.error('❌ Erreur insertion commande Supabase:', error);
            continue;
          }

          // Enregistrer les articles + MAJ stock
          for (const item of items) {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 1;

            const { error: itemErr } = await supabase.from('order_items').insert([
              {
                order_id: order.id,
                product_id: item.id,
                quantity: qty,
                price_at_purchase: price,
              },
            ]);

            if (itemErr) {
              console.error('❌ Erreur insertion order_items:', itemErr);
            }

            // MAJ stock simple (si la table products a bien "stock")
            const { data: currentProd, error: stockErr } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.id)
              .single();

            if (stockErr) {
              console.error('❌ Erreur récupération stock produit:', stockErr);
            }

            if (currentProd) {
              const currentStock = Number(currentProd.stock) || 0;
              const newStock = Math.max(0, currentStock - qty);

              const { error: updErr } = await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.id);

              if (updErr) {
                console.error('❌ Erreur mise à jour stock produit:', updErr);
              }
            }
          }

          // Email de confirmation par fournisseur
          if (customerEmail) {
            await sendOrderEmail(customerEmail, order.id, supplierName, supplierAmount);
          }
        }

        // on répond au webhook
        return res.send();
      }
    }

    // ✅ FALLBACK : ancienne logique (compat sessions plus anciennes)
    const { supplierId, supplierName, productIds } = metadata;
    if (supplierId && productIds) {
      let products = [];
      try {
        products = JSON.parse(productIds);
      } catch (e) {
        console.error('❌ Impossible de parser productIds legacy:', e);
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert([
          {
            buyer_id: userId,
            supplier_id: supplierId,
            total_amount: amount,
            status: 'pending',
            payment_term: 'pay_now',
            payment_status: 'paid',
          },
        ])
        .select()
        .single();

      if (!error && order) {
        for (const prodId of products) {
          const { data: p } = await supabase
            .from('products')
            .select('price')
            .eq('id', prodId)
            .single();

          if (p) {
            await supabase.from('order_items').insert([
              {
                order_id: order.id,
                product_id: prodId,
                quantity: 1,
                price_at_purchase: p.price,
              },
            ]);
          }
        }

        if (customerEmail) {
          await sendOrderEmail(
            customerEmail,
            order.id,
            supplierName || 'Fournisseur',
            amount
          );
        }
      } else {
        console.error('Erreur insertion commande Supabase (legacy):', error);
      }
    }
  }

  res.send();
});

// --- API 3 : GÉNÉRER L'ÉTIQUETTE SHIPPO ---
app.post('/api/create-label', async (req, res) => {
  try {
    const { order_id } = req.body;
    const SHIPPO_KEY = process.env.SHIPPO_KEY;

    if (!SHIPPO_KEY) {
      return res
        .status(500)
        .json({ error: 'Configuration serveur: Clé Shippo manquante' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer: profiles!buyer_id (email, company_name, address_line1, city, state, postal_code, phone),
        supplier: profiles!supplier_id (email, company_name, address_line1, city, state, postal_code, phone)
      `)
      .eq('id', order_id)
      .single();

    if (error || !order)
      return res.status(404).json({ error: 'Commande introuvable' });

    const payload = {
      address_from: {
        name: order.supplier?.company_name || 'Fournisseur',
        street1: order.supplier?.address_line1,
        city: order.supplier?.city,
        state: order.supplier?.state,
        zip: order.supplier?.postal_code,
        country: 'CA',
        phone: order.supplier?.phone || '5555555555',
        email: order.supplier?.email,
      },
      address_to: {
        name: order.buyer?.company_name || 'Client',
        street1: order.buyer?.address_line1,
        city: order.buyer?.city,
        state: order.buyer?.state,
        zip: order.buyer?.postal_code,
        country: 'CA',
        phone: order.buyer?.phone || '5555555555',
        email: order.buyer?.email,
      },
      parcels: [
        {
          length: '10',
          width: '10',
          height: '10',
          distance_unit: 'in',
          weight: '2',
          mass_unit: 'kg',
        },
      ],
      async: false,
    };

    const shippoResponse = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        Authorization: `ShippoToken ${SHIPPO_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const shipment = await shippoResponse.json();

    if (!shipment.rates || shipment.rates.length === 0) {
      return res
        .status(400)
        .json({ error: 'Aucun tarif trouvé pour cette adresse.' });
    }

    const rate = shipment.rates[0];
    const transactionResponse = await fetch(
      'https://api.goshippo.com/transactions/',
      {
        method: 'POST',
        headers: {
          Authorization: `ShippoToken ${SHIPPO_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rate: rate.object_id,
          label_file_type: 'PDF_4x6',
        }),
      }
    );

    const transaction = await transactionResponse.json();

    if (transaction.status !== 'SUCCESS') {
      return res
        .status(400)
        .json({ error: 'Erreur achat étiquette', details: transaction.messages });
    }

    res.json({
      success: true,
      label_url: transaction.label_url,
      tracking_number: transaction.tracking_number,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- SERVIR LE FRONTEND (React) ---
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

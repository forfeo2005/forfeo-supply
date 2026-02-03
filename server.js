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
    const customerEmail = session.

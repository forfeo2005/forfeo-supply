import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

// Configuration du serveur
const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());

// Connexion Supabase (Côté Serveur - Privé)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- API : GÉNÉRER L'ÉTIQUETTE SHIPPO ---
app.post('/api/create-label', async (req, res) => {
  try {
    const { order_id } = req.body;
    const SHIPPO_KEY = process.env.SHIPPO_KEY;

    if (!SHIPPO_KEY) {
      return res.status(500).json({ error: "Configuration serveur: Clé Shippo manquante" });
    }

    // 1. Récupérer les infos de la commande dans Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer: profiles!buyer_id (email, company_name, address_line1, city, state, postal_code, phone),
        supplier: profiles!supplier_id (email, company_name, address_line1, city, state, postal_code, phone)
      `)
      .eq('id', order_id)
      .single();

    if (error || !order) return res.status(404).json({ error: "Commande introuvable" });

    // 2. Préparer les données pour Shippo
    const payload = {
      address_from: {
        name: order.supplier.company_name || "Fournisseur",
        street1: order.supplier.address_line1,
        city: order.supplier.city,
        state: order.supplier.state,
        zip: order.supplier.postal_code,
        country: "CA",
        phone: order.supplier.phone || "5555555555",
        email: order.supplier.email
      },
      address_to: {
        name: order.buyer.company_name || "Client",
        street1: order.buyer.address_line1,
        city: order.buyer.city,
        state: order.buyer.state,
        zip: order.buyer.postal_code,
        country: "CA",
        phone: order.buyer.phone || "5555555555",
        email: order.buyer.email
      },
      parcels: [{
        length: "10", width: "10", height: "10", distance_unit: "in",
        weight: "2", mass_unit: "kg"
      }],
      async: false
    };

    // 3. Appel à l'API Shippo
    const shippoResponse = await fetch('https://api.goshippo.com/shipments/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const shipment = await shippoResponse.json();
    
    if (!shipment.rates || shipment.rates.length === 0) {
      return res.status(400).json({ error: "Aucun tarif trouvé pour cette adresse." });
    }

    // 4. Acheter l'étiquette la moins chère
    const rate = shipment.rates[0];
    const transactionResponse = await fetch('https://api.goshippo.com/transactions/', {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rate: rate.object_id, label_file_type: "PDF_4x6" })
    });

    const transaction = await transactionResponse.json();

    if (transaction.status !== "SUCCESS") {
      return res.status(400).json({ error: "Erreur achat étiquette", details: transaction.messages });
    }

    // 5. Succès ! On renvoie l'URL
    res.json({ 
      success: true, 
      label_url: transaction.label_url, 
      tracking_number: transaction.tracking_number 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- SERVIR LE FRONTEND (React) ---
// En production, le serveur renvoie les fichiers statiques de Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Pour toutes les autres routes, renvoyer l'app React (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

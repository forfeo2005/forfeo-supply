import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Initialisation des variables d'environnement
dotenv.config();

const app = express();
app.use(express.json());

// Accepte toutes les origines pour éviter les erreurs CORS
app.use(cors({ origin: '*' }));

// Connexion Supabase
const supabaseUrl = process.env.SUPABASE_URL;
// Note : Pour générer des étiquettes, l'idéal est d'utiliser la SERVICE_ROLE_KEY ici
// si tes règles de sécurité (RLS) sont strictes. Sinon la clé ANON (SUPABASE_KEY) suffit.
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ROUTES EXISTANTES (CONSERVÉES À 100%) ---

// Route de test
app.get('/', (req, res) => {
  res.send('API Forfeo Supply is running!');
});

// 1. Récupérer les produits depuis Supabase
app.get('/api/products', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 2. Créer une commande (Simulation)
app.post('/api/orders', async (req, res) => {
  const { productId, quantity } = req.body;
  // Ici on pourrait ajouter une ligne dans une table 'orders'
  res.json({ 
    success: true, 
    message: `Commande reçue pour le produit ID ${productId} (Qté: ${quantity})` 
  });
});

// --- NOUVELLE FONCTIONNALITÉ : SHIPPO ---

// 3. Générer une étiquette de livraison (Vraie API Shippo)
app.post('/api/create-label', async (req, res) => {
  try {
    const { order_id } = req.body;
    const SHIPPO_KEY = process.env.SHIPPO_KEY;

    if (!SHIPPO_KEY) {
      return res.status(500).json({ error: "Clé Shippo manquante sur le serveur (.env)" });
    }

    console.log(`Traitement de l'étiquette pour la commande: ${order_id}`);

    // A. Récupérer les infos complètes dans Supabase
    // On va chercher la commande, l'acheteur et le fournisseur
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer: profiles!buyer_id (email, company_name, address_line1, city, state, postal_code, phone),
        supplier: profiles!supplier_id (email, company_name, address_line1, city, state, postal_code, phone)
      `)
      .eq('id', order_id)
      .single();

    if (error || !order) {
      console.error("Erreur Supabase:", error);
      return res.status(404).json({ error: "Commande introuvable dans la base de données" });
    }

    // B. Vérifier que les adresses sont remplies
    if (!order.supplier?.address_line1 || !order.buyer?.address_line1) {
      return res.status(400).json({ error: "Adresses incomplètes. Vérifiez les profils Acheteur et Fournisseur." });
    }

    // C. Préparer le colis pour l'API Shippo
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

    // D. Appel à l'API Shippo pour voir les tarifs
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
      console.error("Shippo Error (Rates):", shipment);
      return res.status(400).json({ error: "Aucun tarif trouvé pour cette adresse." });
    }

    // E. Acheter l'étiquette la moins chère (le premier tarif de la liste)
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
      console.error("Shippo Transaction Error:", transaction);
      return res.status(400).json({ error: "Erreur achat étiquette", details: transaction.messages });
    }

    // F. Succès ! On renvoie l'URL du PDF
    res.json({ 
      success: true, 
      label_url: transaction.label_url, 
      tracking_number: transaction.tracking_number 
    });

  } catch (err) {
    console.error("Erreur serveur:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

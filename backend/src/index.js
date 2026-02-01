const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());
// Accepte toutes les origines pour éviter les erreurs CORS en démo
app.use(cors({ origin: '*' }));

// Connexion Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

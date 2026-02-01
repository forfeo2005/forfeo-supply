import React, { useEffect, useState } from 'react';

// CORRECTION : Render donne le "host" sans le protocole.
// On vérifie si l'URL commence par http, sinon on ajoute https://
const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = RAW_URL.startsWith('http') ? RAW_URL : `https://${RAW_URL}`;

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // On log l'URL pour être sûr dans la console
    console.log("Appel API vers :", `${API_URL}/api/products`);

    fetch(`${API_URL}/api/products`)
      .then(res => {
        // Si l'API renvoie une erreur (ex: 404 ou 500)
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur Fetch:", err);
        setMsg(`Erreur de connexion : ${err.message}`);
        setLoading(false);
      });
  }, []);

  const commander = (id) => {
    fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id, quantity: 10 })
    })
    .then(res => res.json())
    .then(data => setMsg(data.message))
    .catch(() => setMsg("Erreur lors de la commande"));
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ color: '#2E7D32' }}>Forfeo Supply 🌱</h1>
      
      {msg && <div style={{ padding: 10, background: '#e3f2fd', marginBottom: 20, borderRadius: 4 }}>{msg}</div>}
      
      {loading ? (
        <p>Chargement des produits...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {products.map(p => (
            <div key={p.id} style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
              <span style={{ fontSize: 12, background: '#eee', padding: '2px 6px', borderRadius: 4 }}>{p.category}</span>
              <h3>{p.name}</h3>
              <p style={{ color: '#666' }}>{p.producer}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <strong>{p.price} $</strong>
                <button 
                  onClick={() => commander(p.id)}
                  style={{ background: '#2E7D32', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 4, cursor: 'pointer' }}
                >
                  Commander
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

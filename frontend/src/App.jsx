import React, { useEffect, useState } from 'react';

// CORRECTION : On met l'adresse publique exacte qu'on a vue sur ta capture d'écran
// Cela évite tous les problèmes de variables d'environnement
const API_URL = 'https://forfeo-supply-api.onrender.com';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Petit log pour vérifier dans la console que l'adresse est bonne
    console.log("Tentative de connexion vers :", `${API_URL}/api/products`);

    fetch(`${API_URL}/api/products`)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur Fetch:", err);
        setMsg(`Erreur : Impossible de joindre le serveur. (${err.message})`);
        setLoading(false);
      });
  }, []);

  const commander = (id) => {
    setMsg('Traitement en cours...');
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
      
      {msg && <div style={{ padding: 15, background: '#e3f2fd', marginBottom: 20, borderRadius: 8, border: '1px solid #90caf9' }}>{msg}</div>}
      
      {loading ? (
        <p>Chargement du catalogue...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
          {products.map(p => (
            <div key={p.id} style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8, backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: 12, background: '#e8f5e9', padding: '4px 8px', borderRadius: 12, color: '#2e7d32', fontWeight: 'bold' }}>{p.category}</span>
              <h3 style={{ margin: '10px 0 5px 0' }}>{p.name}</h3>
              <p style={{ color: '#666', fontSize: '0.9em', margin: 0 }}>{p.producer}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 }}>
                <strong style={{ fontSize: '1.1em' }}>{p.price} $</strong>
                <button 
                  onClick={() => commander(p.id)}
                  style={{ background: '#2E7D32', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
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

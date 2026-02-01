import React, { useEffect, useState } from 'react';

// Récupération automatique de l'URL du backend via Render
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // Appel au backend (qui lui appelle Supabase)
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
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

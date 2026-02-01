import React, { useEffect, useState } from 'react';

// On garde l'URL qui fonctionne
const API_URL = 'https://forfeo-supply-api.onrender.com';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Chargement des produits au démarrage
  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        setMsg("Impossible de charger le catalogue.");
      });
  }, []);

  // Fonction pour passer commande
  const commander = (id, productName) => {
    setMsg(`Commande en cours pour ${productName}...`);
    
    fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id, quantity: 10 })
    })
    .then(res => res.json())
    .then(data => {
      setMsg(`✅ ${data.message}`);
      // On efface le message après 3 secondes
      setTimeout(() => setMsg(''), 3000);
    })
    .catch(() => setMsg("❌ Erreur lors de la commande."));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#1b5e20', marginBottom: '0.5rem' }}>Le Marché du Jour</h2>
        <p style={{ color: '#666' }}>Produits frais disponibles pour livraison demain.</p>
      </div>
      
      {/* Message de notification */}
      {msg && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: msg.includes('✅') ? '#e8f5e9' : '#ffebee',
          color: msg.includes('✅') ? '#2e7d32' : '#c62828',
          marginBottom: '2rem', 
          borderRadius: '8px',
          textAlign: 'center',
          fontWeight: 'bold',
          border: msg.includes('✅') ? '1px solid #a5d6a7' : '1px solid #ef9a9a'
        }}>
          {msg}
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Chargement du terroir...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {products.map(p => (
            <div key={p.id} style={cardStyle}>
              <div style={{ padding: '1.5rem' }}>
                <span style={categoryBadgeStyle}>{p.category}</span>
                
                <h3 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.4rem', color: '#333' }}>{p.name}</h3>
                <p style={{ color: '#757575', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Par <span style={{ color: '#2E7D32', fontWeight: '500' }}>{p.producer}</span>
                </p>
                
                <div style={{ borderTop: '1px solid #eee', margin: '1rem -1.5rem 0 -1.5rem' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>{p.price} $</span>
                    <span style={{ fontSize: '0.8rem', color: '#999' }}>par {p.unit}</span>
                  </div>
                  
                  <button 
                    onClick={() => commander(p.id, p.name)} 
                    style={buttonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1b5e20'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#2E7D32'}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styles
const cardStyle = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  border: '1px solid #f0f0f0',
  overflow: 'hidden'
};

const categoryBadgeStyle = {
  backgroundColor: '#e8f5e9', 
  color: '#2e7d32', 
  padding: '6px 10px', 
  borderRadius: '20px', 
  fontSize: '0.75rem', 
  fontWeight: '700',
  letterSpacing: '0.5px',
  textTransform: 'uppercase'
};

const buttonStyle = {
  backgroundColor: '#2E7D32', 
  color: 'white', 
  border: 'none', 
  padding: '10px 20px', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: '600',
  fontSize: '0.95rem',
  transition: 'background-color 0.2s',
  boxShadow: '0 2px 4px rgba(46, 125, 50, 0.2)'
};

export default Marketplace;

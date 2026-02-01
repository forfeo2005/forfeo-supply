import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#333', paddingBottom: '4rem' }}>
      
      {/* --- HERO SECTION --- */}
      <header style={{ 
        backgroundColor: '#e8f5e9', 
        padding: '6rem 2rem', 
        textAlign: 'center',
        borderBottom: '1px solid #c8e6c9'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          color: '#1b5e20', 
          marginBottom: '1.5rem',
          fontWeight: '800',
          letterSpacing: '-1px'
        }}>
          De la Terre à la Table.
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#4caf50', 
          maxWidth: '700px', 
          margin: '0 auto 3rem auto',
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          Forfeo Supply connecte directement les meilleurs restaurateurs de Québec aux producteurs locaux. Sans intermédiaire inutile, pour une fraîcheur absolue.
        </p>
        <Link to="/market" style={{ 
          backgroundColor: '#2E7D32', 
          color: 'white', 
          padding: '1rem 2.5rem', 
          borderRadius: '50px', 
          textDecoration: 'none', 
          fontSize: '1.2rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
          transition: 'transform 0.2s'
        }}>
          Voir les produits frais →
        </Link>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '2rem', 
        padding: '4rem 2rem', 
        flexWrap: 'wrap',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={featureStyle}>
          <div style={iconStyle}>🚚</div>
          <h3 style={titleStyle}>Logistique Simplifiée</h3>
          <p style={textStyle}>Une seule livraison, une seule facture consolidée pour tous vos producteurs préférés.</p>
        </div>
        <div style={featureStyle}>
          <div style={iconStyle}>🥕</div>
          <h3 style={titleStyle}>Fraîcheur Maximale</h3>
          <p style={textStyle}>Récolté le matin, livré l'après-midi. Une transparence totale sur l'origine.</p>
        </div>
        <div style={featureStyle}>
          <div style={iconStyle}>🤝</div>
          <h3 style={titleStyle}>Prix Producteur</h3>
          <p style={textStyle}>Les producteurs fixent leurs prix. Forfeo assure la connexion équitable.</p>
        </div>
      </section>

    </div>
  );
};

// Styles internes pour garder le code propre
const featureStyle = {
  flex: '1',
  minWidth: '280px',
  padding: '2.5rem',
  textAlign: 'center',
  backgroundColor: 'white',
  borderRadius: '16px',
  border: '1px solid #f0f0f0',
  boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
};

const iconStyle = {
  fontSize: '3rem',
  marginBottom: '1rem',
  background: '#f1f8e9',
  width: '80px',
  height: '80px',
  lineHeight: '80px',
  borderRadius: '50%',
  margin: '0 auto 1.5rem auto'
};

const titleStyle = {
  fontSize: '1.5rem',
  marginBottom: '1rem',
  color: '#2E7D32',
  fontWeight: '700'
};

const textStyle = {
  color: '#666',
  lineHeight: '1.6'
};

export default Home;

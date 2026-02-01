import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const styles = {
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      borderBottom: '1px solid #eee'
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#2E7D32', // Vert Forfeo
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    links: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center'
    },
    link: {
      textDecoration: 'none',
      color: '#555',
      fontWeight: '500',
      transition: 'color 0.2s',
      fontSize: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    cta: {
      backgroundColor: '#2E7D32',
      color: 'white',
      padding: '0.6rem 1.2rem',
      borderRadius: '6px',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontSize: '1rem',
      transition: 'background-color 0.2s',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        🌱 Forfeo Supply
      </Link>
      
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Accueil</Link>
        <Link to="/market" style={styles.link}>Le Marché</Link>
        <Link to="/about" style={styles.link}>À Propos</Link>
      </div>

      <Link to="/market" style={styles.cta}>
        Commander
      </Link>
    </nav>
  );
};

export default Header;

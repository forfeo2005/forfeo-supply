import React from 'react';

const About = () => {
  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '4rem 2rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif', 
      color: '#333' 
    }}>
      
      {/* En-tête de page */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          color: '#1b5e20', 
          marginBottom: '1rem', 
          fontWeight: '800',
          letterSpacing: '-1px'
        }}>
          Notre Mission
        </h1>
        <p style={{ fontSize: '1.3rem', color: '#555', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
          Reconnecter les chefs et les producteurs de Québec grâce à la technologie.
        </p>
      </div>

      {/* Bloc de contenu principal */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '3rem', 
        borderRadius: '24px', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
        border: '1px solid #f0f0f0'
      }}>
        
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#2E7D32', fontSize: '1.8rem', marginBottom: '1rem' }}>Le Problème</h2>
          <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444' }}>
            Forfeo Supply est né d'un constat simple sur le terrain : les chefs de Québec veulent cuisiner local, mais la logistique est un frein majeur. 
            Multiplier les factures, gérer 15 livraisons différentes et négocier par SMS avec chaque ferme prend trop de temps.
          </p>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#2E7D32', fontSize: '1.8rem', marginBottom: '1rem' }}>La Solution Forfeo</h2>
          <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444', marginBottom: '1.5rem' }}>
            Nous agissons comme un tiers de confiance transparent. Nous centralisons la logistique administrative et physique, tout en laissant l'identité du producteur au premier plan.
          </p>
          <ul style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444', paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.8rem' }}><strong>Pour le Chef :</strong> Un seul catalogue, une seule livraison, une seule facture.</li>
            <li style={{ marginBottom: '0.8rem' }}><strong>Pour le Producteur :</strong> Accès à plus de restaurants, logistique simplifiée, paiement garanti.</li>
          </ul>
        </section>

        <div style={{ 
          borderTop: '2px dashed #e0e0e0', 
          paddingTop: '2rem', 
          textAlign: 'center',
          marginTop: '2rem' 
        }}>
          <p style={{ fontStyle: 'italic', color: '#777', fontSize: '1.1rem' }}>
            "Parce que bien manger commence par bien s'approvisionner."
          </p>
          <p style={{ fontWeight: 'bold', marginTop: '1rem', color: '#1b5e20' }}>— L'équipe Forfeo</p>
        </div>

      </div>
    </div>
  );
};

export default About;

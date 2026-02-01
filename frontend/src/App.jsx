import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import des composants que nous avons créés
import Header from './components/Header';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        
        {/* Le Header reste visible sur toutes les pages */}
        <Header />

        {/* Le système de Routes décide quelle page afficher selon l'URL */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/about" element={<About />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;

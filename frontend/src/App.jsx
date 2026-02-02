import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import des composants
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import About from './pages/About';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Privacy from './pages/Privacy';
import MerchantDashboard from './pages/MerchantDashboard'; // <--- NOUVEAU

// Création d'un Layout standard pour les pages publiques
// Cela permet d'avoir le Header en haut et le Footer en bas sur toutes ces pages
const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    {/* On utilise le composant Header.jsx qui gère le design transparent/blanc */}
    <Header /> 
    
    <main className="flex-grow">
      {children}
    </main>
    
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        
        <Routes>
          {/* 1. ROUTES DASHBOARD (Isolées) */}
          {/* Ces pages ont leur propre affichage sans le Header/Footer public */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Espace Fournisseur */}
          <Route path="/merchant" element={<MerchantDashboard />} /> {/* Espace Acheteur (NOUVEAU) */}
          
          {/* 2. ROUTES PUBLIQUES (Avec Layout) */}
          {/* Toutes ces pages auront le Header et le Footer automatiquement */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/market" element={<Layout><Marketplace /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          
          {/* Route pour la conformité légale */}
          <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import des composants
import Header from './components/Header';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import About from './pages/About';
import Login from './pages/Login'; // <--- NOUVEAU

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        
        {/* HEADER AMÉLIORÉ AVEC TAILWIND */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  <span className="font-bold text-xl text-forfeo-700 tracking-tight">Forfeo Supply</span>
                </Link>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                  <Link to="/" className="text-slate-600 hover:text-forfeo-600 px-3 py-2 text-sm font-medium transition">Accueil</Link>
                  <Link to="/market" className="text-slate-600 hover:text-forfeo-600 px-3 py-2 text-sm font-medium transition">Le Marché</Link>
                  <Link to="/about" className="text-slate-600 hover:text-forfeo-600 px-3 py-2 text-sm font-medium transition">À Propos</Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Bouton Connexion */}
                <Link to="/login" className="text-slate-500 hover:text-forfeo-600 font-medium text-sm">
                  Se connecter
                </Link>
                <Link to="/market" className="bg-forfeo-600 hover:bg-forfeo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition transform hover:-translate-y-0.5">
                  Commander
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} /> {/* <--- ROUTE LOGIN */}
        </Routes>

      </div>
    </Router>
  );
}

export default App;

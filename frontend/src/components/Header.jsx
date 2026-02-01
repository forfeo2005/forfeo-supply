import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Si on est sur la page d'accueil, le header est transparent (plus joli)
  // Sinon, il est blanc classique.
  const headerClass = isHome 
    ? "absolute top-0 w-full z-50 bg-transparent border-b border-white/10 text-white" 
    : "bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-50";

  const linkClass = isHome
    ? "text-white/80 hover:text-white font-medium transition"
    : "text-slate-600 hover:text-forfeo-600 font-medium transition";

  return (
    <nav className={`${headerClass} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl transform group-hover:rotate-12 transition-transform">🌱</span>
          <span className={`text-xl font-extrabold tracking-tight ${isHome ? 'text-white' : 'text-slate-900'}`}>
            Forfeo<span className={isHome ? 'text-forfeo-300' : 'text-forfeo-600'}>Supply</span>
          </span>
        </Link>

        {/* LIENS */}
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/" className={linkClass}>Accueil</Link>
          <Link to="/market" className={linkClass}>Explorer</Link>
          <Link to="/about" className={linkClass}>Mission</Link>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4">
          <Link to="/login" className={`hidden sm:block px-4 py-2 rounded-lg font-medium transition ${
            isHome ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-50 text-slate-600'
          }`}>
            Se connecter
          </Link>
          <Link to="/login" className="bg-forfeo-600 hover:bg-forfeo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-forfeo-900/20 transition-all hover:-translate-y-0.5">
            Commencer
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // <--- 1. IMPORT DU CONTEXTE

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // 2. RÉCUPÉRATION DU NOMBRE D'ARTICLES
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClass = isHomePage && !isScrolled 
    ? 'bg-transparent text-white py-6' 
    : 'bg-white/90 backdrop-blur-md text-slate-900 shadow-sm py-4';

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${navClass}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
          <span className="text-3xl">🌱</span>
          <span>Forfeo<span className="text-forfeo-500">Market</span></span>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link to="/" className="hover:text-forfeo-500 transition">Accueil</Link>
          <Link to="/market" className="hover:text-forfeo-500 transition">Explorer</Link>
          <Link to="/about" className="hover:text-forfeo-500 transition">Mission</Link>
        </nav>

        {/* ACTIONS DROITE */}
        <div className="flex items-center gap-6">
          
          {/* 3. ICÔNE PANIER (Nouveau) */}
          <Link to="/cart" className="relative group mr-2">
            <span className="text-2xl hover:scale-110 transition block">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/login" className="hover:text-forfeo-500 font-medium transition">
            Se connecter
          </Link>
          <Link 
            to="/login" 
            className={`px-5 py-2.5 rounded-full font-bold transition shadow-lg hover:-translate-y-0.5 ${
              isHomePage && !isScrolled 
                ? 'bg-white text-forfeo-600 hover:bg-slate-100' 
                : 'bg-forfeo-600 text-white hover:bg-forfeo-700'
            }`}
          >
            Commencer
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Header;

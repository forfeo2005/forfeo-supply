import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';
// Utilisation de ShoppingCart au lieu de ShoppingBag
import { Menu, X, ShoppingCart, User } from 'lucide-react';
import ForfeoLogo from './ForfeoLogo'; // Import du nouveau logo

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  // Détermine la couleur du texte et des icônes selon l'état du scroll
  const textColorClass = scrolled || mobileMenuOpen ? 'text-slate-900' : 'text-white';
  // Pour le logo, on lui dit s'il doit être foncé ou non
  const isDarkLogo = scrolled || mobileMenuOpen;

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
      }`}
    >
      {/* Padding horizontal réduit et centrage vertical amélioré */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        
        {/* LOGO ET NOM */}
        <Link to="/" className="flex items-center gap-2 group">
          <ForfeoLogo className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-105" dark={isDarkLogo} />
          <span className={`text-lg sm:text-xl font-extrabold tracking-tight ${textColorClass} transition-colors`}>
            Forfeo
          </span>
        </Link>

        {/* NAVIGATION DESKTOP (Espacement réduit gap-6) */}
        <nav className="hidden md:flex items-center gap-6">
          {['Market', 'About'].map((item) => (
            <Link 
              key={item} 
              to={`/${item.toLowerCase()}`} 
              // Police légèrement plus grasse pour la lisibilité
              className={`text-sm font-semibold hover:text-emerald-500 transition-colors ${textColorClass}`}
            >
              {item === 'Market' ? 'Le Marché' : 'À propos'}
            </Link>
          ))}
        </nav>

        {/* ACTIONS (Panier & Compte) */}
        <div className="hidden md:flex items-center gap-3 sm:gap-4">
          {/* Icône Panier (ShoppingCart) avec couleur dynamique */}
          <Link to="/cart" className={`relative p-2 rounded-full hover:bg-white/10 transition-colors ${textColorClass}`}>
            <ShoppingCart size={22} strokeWidth={2.5} /> {/* strokeWidth pour rendre l'icône plus "épaisse" */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/merchant')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm"
              >
                Mon Espace
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              // Bouton Connexion plus compact
              className={`font-bold text-sm px-4 py-2 rounded-lg border-2 transition-all ${
                scrolled 
                  ? 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white' 
                  : 'border-white text-white hover:bg-white hover:text-slate-900'
              }`}
            >
              Connexion
            </Link>
          )}
        </div>

        {/* BOUTON MENU MOBILE (Couleur dynamique) */}
        <button 
          className={`md:hidden p-1 ${textColorClass}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MENU MOBILE DÉROULANT (Resserré) */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-xl p-4 flex flex-col gap-2 animate-fade-in">
          <Link to="/market" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50">Le Marché</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50">À propos</Link>
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2"><ShoppingCart size={18}/> Mon Panier</div>
            {cartCount > 0 && <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">{cartCount}</span>}
          </Link>
          
          {user ? (
            <>
              <button onClick={() => {navigate('/merchant'); setMobileMenuOpen(false)}} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-2">Mon Tableau de bord</button>
              <button onClick={() => {handleLogout(); setMobileMenuOpen(false)}} className="w-full text-red-500 py-2 text-sm font-bold mt-1">Déconnexion</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-center mt-2 shadow-sm">
              Se connecter / S'inscrire
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

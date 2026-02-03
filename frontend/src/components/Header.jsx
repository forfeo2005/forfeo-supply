import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';
import { Menu, X, ShoppingBag, User } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Vérifier si connecté
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    // Effet de scroll pour le header
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-emerald-600 text-white p-2 rounded-xl font-bold text-xl transform group-hover:rotate-12 transition-transform">F</div>
          <span className={`text-xl font-extrabold tracking-tight ${scrolled || mobileMenuOpen ? 'text-slate-900' : 'text-white'} transition-colors`}>
            Forfeo
          </span>
        </Link>

        {/* NAVIGATION DESKTOP */}
        <nav className="hidden md:flex items-center gap-8">
          {['Market', 'About'].map((item) => (
            <Link 
              key={item} 
              to={`/${item.toLowerCase()}`} 
              className={`text-sm font-medium hover:text-emerald-500 transition ${
                scrolled ? 'text-slate-600' : 'text-slate-200'
              }`}
            >
              {item === 'Market' ? 'Le Marché' : 'À propos'}
            </Link>
          ))}
        </nav>

        {/* ACTIONS (Panier & Compte) */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/cart" className={`relative p-2 rounded-full hover:bg-white/10 transition ${scrolled ? 'text-slate-900' : 'text-white'}`}>
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/merchant')} // Ou dashboard selon rôle, simple redirect ici
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-900/20"
              >
                Mon Espace
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className={`font-bold text-sm px-5 py-2.5 rounded-xl border-2 transition ${
                scrolled 
                  ? 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white' 
                  : 'border-white text-white hover:bg-white hover:text-slate-900'
              }`}
            >
              Connexion
            </Link>
          )}
        </div>

        {/* BOUTON MENU MOBILE */}
        <button 
          className={`md:hidden p-2 ${scrolled || mobileMenuOpen ? 'text-slate-900' : 'text-white'}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* --- MENU MOBILE DÉROULANT --- */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-2xl p-6 flex flex-col gap-4 animate-fade-in">
          <Link to="/market" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-800 py-2 border-b border-slate-50">Le Marché</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-800 py-2 border-b border-slate-50">À propos</Link>
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-slate-800 py-2 border-b border-slate-50 flex justify-between">
            Mon Panier 
            {cartCount > 0 && <span className="bg-emerald-100 text-emerald-700 px-2 rounded-full text-sm">{cartCount} items</span>}
          </Link>
          
          {user ? (
            <>
              <button onClick={() => {navigate('/merchant'); setMobileMenuOpen(false)}} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-2">Mon Tableau de bord</button>
              <button onClick={() => {handleLogout(); setMobileMenuOpen(false)}} className="w-full text-red-500 py-2 text-sm font-bold">Déconnexion</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-center mt-2 shadow-lg">
              Se connecter / S'inscrire
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

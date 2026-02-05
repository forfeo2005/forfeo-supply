import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';
import { Menu, X, ShoppingCart } from 'lucide-react';
import ForfeoLogo from './ForfeoLogo';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // -------------------------
  // ✅ Auth: live sync (login/logout)
  // -------------------------
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data?.user ?? null);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // -------------------------
  // ✅ Scroll once
  // -------------------------
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // -------------------------
  // ✅ Close mobile menu on route change
  // -------------------------
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // -------------------------
  // ✅ Lock body scroll when mobile menu open (iOS friendly)
  // -------------------------
  useEffect(() => {
    const original = document.body.style.overflow;
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange s'occupe du setUser(null)
    navigate('/');
  };

  const isSolid = scrolled || mobileMenuOpen;

  // MODIFICATION : Toujours utiliser des couleurs contrastées pour les icônes
  const textColorClass = 'text-slate-800';
  const iconColorClass = 'text-slate-800';
  const isDarkLogo = true; // Toujours utiliser le logo sombre pour la visibilité

  const headerClassName = useMemo(() => {
    return `fixed w-full z-50 transition-all duration-300 ${
      isSolid ? 'bg-white/95 backdrop-blur-md shadow-sm py-2' : 'bg-white/90 backdrop-blur-sm py-4'
    }`;
  }, [isSolid]);

  return (
    <header className={headerClassName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-emerald-400/60 rounded-lg"
          aria-label="Aller à l'accueil"
        >
          <ForfeoLogo
            className="w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-105"
            dark={isDarkLogo}
          />
          <span
            className={`text-lg sm:text-xl font-extrabold tracking-tight ${textColorClass} transition-colors`}
          >
            Forfeo
          </span>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
          <Link
            to="/market"
            className={`text-sm font-semibold hover:text-emerald-500 transition-colors ${textColorClass} focus:outline-none focus:ring-2 focus:ring-emerald-400/60 rounded-md px-1 py-1`}
          >
            Le Marché
          </Link>

          {/* ✅ Nouveau lien Ressources */}
          <Link
            to="/resources"
            className={`text-sm font-semibold hover:text-emerald-500 transition-colors ${textColorClass} focus:outline-none focus:ring-2 focus:ring-emerald-400/60 rounded-md px-1 py-1`}
          >
            Ressources
          </Link>

          <Link
            to="/about"
            className={`text-sm font-semibold hover:text-emerald-500 transition-colors ${textColorClass} focus:outline-none focus:ring-2 focus:ring-emerald-400/60 rounded-md px-1 py-1`}
          >
            À propos
          </Link>
        </nav>

        {/* ACTIONS DESKTOP */}
        <div className="hidden md:flex items-center gap-3 sm:gap-4">
          {/* Panier */}
          <Link
            to="/cart"
            className={`relative p-2 rounded-full hover:bg-slate-900/5 transition-colors ${iconColorClass} focus:outline-none focus:ring-2 focus:ring-emerald-400/60`}
            aria-label="Voir le panier"
          >
            <ShoppingCart size={22} strokeWidth={2.5} className="text-slate-800" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-extrabold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/merchant')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              >
                Mon Espace
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`font-bold text-sm px-4 py-2 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/60 ${
                'border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white'
              }`}
            >
              Connexion
            </Link>
          )}
        </div>

        {/* BOUTON MOBILE */}
        <button
          className={`md:hidden p-2 rounded-lg ${iconColorClass} hover:bg-slate-900/5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/60`}
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {mobileMenuOpen ? <X size={28} className="text-slate-800" /> : <Menu size={28} className="text-slate-800" />}
        </button>
      </div>

      {/* OVERLAY + MENU MOBILE */}
      {mobileMenuOpen && (
        <>
          {/* overlay */}
          <button
            className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            aria-label="Fermer le menu"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* panel */}
          <div
            id="mobile-menu"
            className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-xl p-4 flex flex-col gap-2 z-50"
          >
            <Link
              to="/market"
              className="text-base font-bold text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50"
            >
              Le Marché
            </Link>

            {/* ✅ Lien mobile vers Ressources */}
            <Link
              to="/resources"
              className="text-base font-bold text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50"
            >
              Ressources
            </Link>

            <Link
              to="/about"
              className="text-base font-bold text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50"
            >
              À propos
            </Link>

            <Link
              to="/cart"
              className="text-base font-bold text-slate-800 py-3 px-4 rounded-lg hover:bg-slate-50 flex justify-between items-center bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-slate-800" /> Mon Panier
              </div>
              {cartCount > 0 && (
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <button
                  onClick={() => navigate('/merchant')}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-2 hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                >
                  Mon Tableau de bord
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-red-600 py-2 text-sm font-extrabold mt-1 hover:bg-red-50 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-center mt-2 shadow-sm hover:bg-emerald-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
              >
                Se connecter / S'inscrire
              </Link>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Header;

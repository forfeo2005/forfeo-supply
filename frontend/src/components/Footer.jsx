// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ForfeoLogo from './ForfeoLogo';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* COLONNE 1 : MARQUE avec nouveau logo */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <ForfeoLogo
                className="w-10 h-10"
                dark={false}
                withText={true}
                size="lg"
              />
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mt-3">
              La plateforme B2B de référence au Québec. Connectez-vous directement aux producteurs et grossistes locaux.
            </p>
          </div>

          {/* COLONNE 2 : LIENS */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Plateforme</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/market" className="hover:text-emerald-400 transition flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                Le Marché
              </Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                Devenir Fournisseur
              </Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                Espace Acheteur
              </Link></li>
            </ul>
          </div>

          {/* COLONNE 3 : LÉGAL */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Support & Légal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-emerald-400 transition flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                À propos
              </Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                Confidentialité
              </Link></li>
              <li><a href="mailto:support@forfeo.com" className="hover:text-emerald-400 transition flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition"></span>
                Nous contacter
              </a></li>
            </ul>
          </div>

          {/* COLONNE 4 : NEWSLETTER */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Restez informé</h4>
            <p className="text-sm text-slate-500 mb-4">Recevez les meilleures offres B2B.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Email professionnel..." 
                className="bg-slate-800 border-none rounded-l-lg text-white px-4 py-3 w-full focus:ring-2 focus:ring-emerald-500 outline-none text-sm placeholder:text-slate-500" 
              />
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-r-lg font-bold text-sm transition">
                S'abonner
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-3">Respect de votre vie privée. Désinscription à tout moment.</p>
          </div>
        </div>

        {/* BAS DE PAGE */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">© 2026</span>
            <ForfeoLogo
              className="w-6 h-6"
              dark={false}
              size="sm"
            />
            <span className="text-xs text-slate-500">Fièrement propulsé au Québec</span>
            <span className="text-emerald-400 ml-1">⚜️</span>
          </div>
          
          <div className="flex gap-3">
            {/* Icônes sociales modernes */}
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition cursor-pointer text-xs text-white hover:scale-105">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition cursor-pointer text-xs text-white hover:scale-105">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition cursor-pointer text-xs text-white hover:scale-105">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.279 16.736 5.02 15.705 5 12c.02-3.705.279-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.979 8.295 19 12c-.021 3.705-.281 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

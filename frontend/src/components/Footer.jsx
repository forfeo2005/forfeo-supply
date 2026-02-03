import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* COLONNE 1 : MARQUE */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">F</div>
              <span className="text-2xl font-bold text-white tracking-tight">Forfeo</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              La plateforme B2B de référence au Québec. Connectez-vous directement aux producteurs et grossistes locaux.
            </p>
          </div>

          {/* COLONNE 2 : LIENS */}
          <div>
            <h4 className="text-white font-bold mb-6">Plateforme</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/market" className="hover:text-emerald-400 transition">Le Marché</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition">Devenir Fournisseur</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition">Espace Acheteur</Link></li>
            </ul>
          </div>

          {/* COLONNE 3 : LÉGAL */}
          <div>
            <h4 className="text-white font-bold mb-6">Support & Légal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-emerald-400 transition">À propos</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition">Confidentialité</Link></li>
              <li><a href="mailto:support@forfeo.com" className="hover:text-emerald-400 transition">Nous contacter</a></li>
            </ul>
          </div>

          {/* COLONNE 4 : NEWSLETTER (Fake mais joli) */}
          <div>
            <h4 className="text-white font-bold mb-6">Restez informé</h4>
            <p className="text-xs text-slate-500 mb-4">Recevez les meilleures offres B2B.</p>
            <div className="flex">
              <input type="email" placeholder="Email pro..." className="bg-slate-800 border-none rounded-l-lg text-white px-4 py-2 w-full focus:ring-1 focus:ring-emerald-500 outline-none text-sm" />
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-r-lg font-bold text-sm transition">OK</button>
            </div>
          </div>
        </div>

        {/* BAS DE PAGE */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">© 2026 Forfeo Inc. Fièrement propulsé au Québec ⚜️</p>
          <div className="flex gap-4">
            {/* Icônes sociales (fictives) */}
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition cursor-pointer text-xs text-white">Ln</div>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition cursor-pointer text-xs text-white">Fb</div>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition cursor-pointer text-xs text-white">Ig</div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

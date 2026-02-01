import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          
          {/* Colonne 1 : Identité */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              🌱 Forfeo Supply
            </h3>
            <p className="text-sm leading-relaxed max-w-sm mb-4">
              La plateforme de référence pour l'approvisionnement B2B au Québec. 
              Simplifiez vos achats, soutenez l'économie locale.
            </p>
            {/* MENTION OBLIGATOIRE SOCIÉTÉ MÈRE */}
            <div className="text-xs bg-slate-800/50 p-3 rounded-lg border border-slate-700 inline-block">
              Forfeo Supply est une division exploitée par <strong className="text-emerald-400">FORFEO INC.</strong>, 
              société par actions enregistrée au Québec.
            </div>
          </div>

          {/* Colonne 2 : Liens */}
          <div>
            <h4 className="text-white font-bold mb-4">Entreprise</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-emerald-400 transition">À Propos</Link></li>
              <li><Link to="/market" className="hover:text-emerald-400 transition">Le Marché</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition">Espace Partenaire</Link></li>
            </ul>
          </div>

          {/* Colonne 3 : Légal */}
          <div>
            <h4 className="text-white font-bold mb-4">Légal & Conformité</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy" className="hover:text-emerald-400 transition">Politique de Confidentialité (Loi 25)</Link></li>
              <li><span className="cursor-not-allowed opacity-50">Conditions d'utilisation (CGU)</span></li>
              <li><span className="cursor-not-allowed opacity-50">Gestion des Cookies</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>© {currentYear} Forfeo Inc. Tous droits réservés.</p>
          <p className="mt-2 md:mt-0">Fait avec ❤️ à Québec.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

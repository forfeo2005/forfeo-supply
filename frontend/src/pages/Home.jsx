import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/market?search=${searchTerm}`);
    }
  };

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
      
      {/* --- HERO SECTION MODERNE --- */}
      <div className="relative bg-slate-900 overflow-hidden">
        
        {/* Arrière-plan avec dégradés complexes (Background Mesh) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-forfeo-800 via-slate-900 to-black opacity-80"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-forfeo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-40 flex flex-col items-center text-center">
          
          {/* Badge du haut */}
          <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-emerald-300 text-xs font-bold tracking-widest uppercase mb-8 hover:bg-white/10 transition cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Marketplace B2B Québec
          </span>

          {/* TITRE HERO - Contraste corrigé */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            Tout votre Business,<br />
            {/* Texte lumineux pour être lisible sur fond sombre */}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 drop-shadow-lg">
              au même endroit.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-light">
            Centralisez vos achats : Fournitures, Alimentaire, Services & Équipements. 
            La première plateforme qui connecte les pros du Québec sans intermédiaire.
          </p>

          {/* BARRE DE RECHERCHE "GLASS" */}
          <form onSubmit={handleSearch} className="w-full max-w-3xl relative group z-10">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              {/* Icône SVG minimaliste */}
              <svg className="w-6 h-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              className="w-full pl-16 pr-32 py-6 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/20 text-slate-900 shadow-2xl shadow-emerald-900/20 focus:ring-4 focus:ring-emerald-500/30 outline-none transition-all text-lg placeholder:text-slate-400"
              placeholder="Recherchez un produit, un service ou un fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 rounded-xl transition-all shadow-lg transform hover:scale-105 active:scale-95"
            >
              Explorer
            </button>
          </form>

          {/* TAGS POPULAIRES MODERNES (Sans Emojis) */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-3">
            <span className="text-slate-500 text-sm font-medium mr-2">Tendances :</span>
            {['Café en gros', 'Papeterie', 'Fruits Bio', 'Entretien', 'Mobilier'].map(tag => (
              <button key={tag} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 hover:text-white hover:border-emerald-500/50 transition-all duration-300">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTEUR (Cartes épurées) --- */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Explorez par secteur</h2>
            <div className="h-1 w-20 bg-emerald-500 mt-4 rounded-full"></div>
          </div>
          <Link to="/market" className="text-emerald-700 font-bold hover:text-emerald-500 transition flex items-center gap-2 mt-4 md:mt-0">
            Voir tout le catalogue <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <CategoryCard title="Alimentaire" count="120+ produits" color="bg-orange-50 text-orange-600" />
          <CategoryCard title="Bureautique" count="85+ produits" color="bg-blue-50 text-blue-600" />
          <CategoryCard title="Hôtellerie" count="40+ fournisseurs" color="bg-purple-50 text-purple-600" />
          <CategoryCard title="Services Pro" count="32+ experts" color="bg-rose-50 text-rose-600" />
        </div>
      </section>

      {/* --- SECTION VALEURS --- */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureItem title="Centralisation Totale" desc="Fini les 50 factures par mois. Un seul portail pour gérer tous vos fournisseurs." />
            <FeatureItem title="Circuit Court B2B" desc="Une connexion directe avec l'économie locale. Moins de camions, plus de fraîcheur." />
            <FeatureItem title="IA Prédictive" desc="Notre algorithme anticipe vos ruptures de stock avant qu'elles n'arrivent." />
          </div>
        </div>
      </section>
    </div>
  );
};

// Composants visuels
const CategoryCard = ({ title, count, color }) => (
  <Link to="/market" className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer relative overflow-hidden">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 font-bold text-xl group-hover:scale-110 transition-transform`}>
      {title.charAt(0)}
    </div>
    <h3 className="font-bold text-xl text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-400 group-hover:text-emerald-600 transition-colors">{count}</p>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
  </Link>
);

const FeatureItem = ({ title, desc }) => (
  <div className="flex flex-col items-start">
    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-xl mb-6">
      ✓
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default Home;

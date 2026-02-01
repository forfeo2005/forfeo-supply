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
    <div className="font-sans text-slate-900">
      
      {/* --- HERO SECTION (Le WOW effect) --- */}
      <div className="relative bg-gradient-to-br from-forfeo-900 via-forfeo-800 to-slate-900 text-white overflow-hidden">
        {/* Cercle décoratif en arrière-plan */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-forfeo-400 opacity-10 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          
          <span className="bg-forfeo-500/20 text-forfeo-100 border border-forfeo-400/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 tracking-wide animate-fade-in-up">
            🚀 La Marketplace B2B #1 à Québec
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Tout votre Business,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-forfeo-300 to-green-200">
              au même endroit.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
            Fournitures de bureau, produits frais, services pro ou équipements. 
            Connectez-vous directement aux meilleurs fournisseurs locaux.
          </p>

          {/* BARRE DE RECHERCHE CENTRALE */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-2xl">🔍</span>
            </div>
            <input
              type="text"
              className="w-full pl-14 pr-32 py-5 rounded-2xl text-slate-900 shadow-2xl focus:ring-4 focus:ring-forfeo-500/30 outline-none transition-all text-lg placeholder:text-slate-400"
              placeholder="Que cherchez-vous aujourd'hui ? (Ex: Papier, Carottes, Nettoyage...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-forfeo-600 hover:bg-forfeo-700 text-white font-bold px-6 rounded-xl transition-all shadow-md"
            >
              Rechercher
            </button>
          </form>

          {/* Tags rapides */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-slate-400">
            <span>Populaire :</span>
            {['☕ Café en gros', '💻 Informatique', '🥦 Légumes', '🧽 Entretien'].map(tag => (
              <button key={tag} className="hover:text-white underline decoration-dotted transition">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- CATÉGORIES (Grille moderne) --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Explorez par secteur</h2>
              <p className="text-slate-500 mt-2">Trouvez les fournisseurs adaptés à votre industrie.</p>
            </div>
            <Link to="/market" className="text-forfeo-600 font-bold hover:underline">Voir tout →</Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CategoryCard icon="🥦" title="Alimentaire" count="120+ produits" />
            <CategoryCard icon="🏢" title="Bureau & Fournitures" count="85+ produits" />
            <CategoryCard icon="🏨" title="Hôtellerie" count="40+ fournisseurs" />
            <CategoryCard icon="🛠️" title="Services & Maintenance" count="32+ pros" />
          </div>
        </div>
      </section>

      {/* --- OFFRES VEDETTES (Section Teaser) --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Pourquoi Forfeo ?</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <FeatureCard 
              icon="⚡" 
              title="Centralisation" 
              desc="Un seul compte, une seule facture mensuelle pour tous vos fournisseurs." 
            />
            <FeatureCard 
              icon="🤝" 
              title="Direct & Local" 
              desc="Soutenez l'économie d'ici. Zéro intermédiaire caché." 
            />
            <FeatureCard 
              icon="🤖" 
              title="IA Intelligente" 
              desc="Notre algorithme prédit vos besoins de réapprovisionnement." 
            />
          </div>
        </div>
      </section>
    </div>
  );
};

// Petits composants pour garder le code propre
const CategoryCard = ({ icon, title, count }) => (
  <Link to="/market" className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all transform hover:-translate-y-1 cursor-pointer">
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <h3 className="font-bold text-lg text-slate-800 mb-1">{title}</h3>
    <p className="text-sm text-slate-400 group-hover:text-forfeo-600 transition-colors">{count}</p>
  </Link>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all">
    <div className="w-14 h-14 mx-auto bg-white rounded-full flex items-center justify-center text-3xl shadow-sm mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default Home;

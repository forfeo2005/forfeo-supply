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
      
      {/* --- HERO SECTION MODERNE (Resserrée) --- */}
      <div className="relative bg-slate-900 overflow-hidden md:min-h-[80vh] flex items-center">
        
        {/* Arrière-plan */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-90"></div>
        {/* Blobs lumineux ajustés pour être moins distrayants */}
        <div className="absolute -top-24 -right-24 w-64 h-64 md:w-96 md:h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 md:w-96 md:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        {/* Contenu Principal - Padding vertical fortement réduit pour resserrer */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center z-10">
          
          {/* Badge du haut */}
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-emerald-300 text-[11px] md:text-xs font-bold tracking-widest uppercase mb-6 hover:bg-white/15 transition cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 relative"></span>
            La Marketplace B2B du Québec
          </span>

          {/* TITRE HERO - Message clarifié et typographie renforcée */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-sm">
            Connectez votre entreprise<br />
            aux <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              fournisseurs d'ici.
            </span>
          </h1>

          {/* Sous-titre élargi - Mentionne clairement la diversité */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium max-w-3xl mb-10 leading-relaxed px-2">
            Plus qu'un marché alimentaire. Centralisez vos achats en 
            <span className="text-white font-semibold"> fournitures de bureau, équipements, services pro et matières premières.</span> 
            Simplifiez votre approvisionnement local.
          </p>

          {/* BARRE DE RECHERCHE "GLASS" (Plus compacte) */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-32 py-3.5 md:py-5 rounded-xl bg-white/90 backdrop-blur-xl border border-white/10 text-slate-900 font-medium shadow-xl focus:ring-4 focus:ring-emerald-500/20 focus:bg-white outline-none transition-all text-base md:text-lg placeholder:text-slate-500"
              placeholder="Qu'est-ce que votre entreprise cherche ?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 md:px-6 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 text-sm md:text-base"
            >
              Trouver
            </button>
          </form>

          {/* TAGS POPULAIRES - Espacement réduit */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
            <span className="text-slate-400 text-xs md:text-sm font-semibold uppercase tracking-wider mr-2">Populaire :</span>
            {['Mobilier Bureau', 'Emballages', 'Café Pro', 'Nettoyage', 'Ingrédients Vrac'].map(tag => (
              <button key={tag} onClick={() => navigate(`/market?search=${tag}`)} className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs md:text-sm font-medium hover:bg-emerald-600/20 hover:text-white hover:border-emerald-500/50 transition-all">
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTEUR (Cartes avec icones plus claires) --- */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Tout pour votre business</h2>
          <p className="text-slate-500 mt-2 font-medium">Explorez nos catégories principales</p>
        </div>

        {/* Grid plus serrée (gap-4) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <CategoryCard title="Alimentaire & Vrac" icon="🥦" color="bg-green-50 text-green-600 border-green-100" />
          <CategoryCard title="Bureautique & TI" icon="💻" color="bg-blue-50 text-blue-600 border-blue-100" />
          <CategoryCard title="Équipement Pro" icon="⚙️" color="bg-orange-50 text-orange-600 border-orange-100" />
          <CategoryCard title="Services & Entretien" icon="🧹" color="bg-purple-50 text-purple-600 border-purple-100" />
        </div>
        
        <div className="text-center mt-10">
            <Link to="/market" className="inline-flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 px-6 py-3 rounded-xl hover:bg-emerald-100 transition">
                Voir tout le catalogue
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </Link>
        </div>
      </section>
    </div>
  );
};

// Composant visuel de catégorie mis à jour (plus compact, meilleur contraste)
const CategoryCard = ({ title, icon, color }) => (
  <Link to="/market" className={`group p-6 rounded-2xl shadow-sm hover:shadow-md border transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center ${color} hover:bg-white hover:border-emerald-200`}>
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">{title}</h3>
  </Link>
);

export default Home;

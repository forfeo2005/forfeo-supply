import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const popularTags = useMemo(
    () => ['Mobilier Bureau', 'Emballages', 'Café Pro', 'Nettoyage', 'Ingrédients Vrac'],
    []
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/market?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
      {/* --- HERO SECTION --- */}
      <div className="relative bg-slate-900 overflow-hidden md:min-h-[82vh] flex items-center">
        {/* Arrière-plan */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-95"></div>

        {/* Blobs lumineux */}
        <div className="absolute -top-24 -right-24 w-64 h-64 md:w-96 md:h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 md:w-96 md:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center z-10">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-emerald-300 text-[11px] md:text-xs font-bold tracking-widest uppercase mb-6 hover:bg-white/15 transition cursor-default">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 relative"></span>
            La marketplace B2B du Québec
          </span>

          {/* Titre */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-sm">
            Forfeo Supply met en relation{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400">
              tous les fournisseurs
            </span>{' '}
            avec les acheteurs.
          </h1>

          {/* Sous-titre vendeur + but du site */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 font-medium max-w-3xl mb-10 leading-relaxed px-2">
            Le but du site : vous aider à <span className="text-white font-semibold">acheter mieux, plus vite et plus local</span>.
            Centralisez vos achats (fournitures, équipements, services pro, matières premières) et découvrez des fournisseurs d’ici,
            au même endroit.
          </p>

          {/* CTA rapides (non bloquants) */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 w-full max-w-2xl justify-center">
            <Link
              to="/market"
              className="inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3.5 rounded-xl transition shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              Explorer le marché
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            {/* Route safe: /merchant existe déjà dans ton Header ("Mon Espace"). Change si tu as une page dédiée fournisseur. */}
            <button
              onClick={() => navigate('/merchant')}
              className="inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold px-6 py-3.5 rounded-xl transition backdrop-blur-md"
              type="button"
            >
              Devenir fournisseur
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z" />
              </svg>
            </button>
          </div>

          {/* BARRE DE RECHERCHE */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              type="text"
              className="w-full pl-12 pr-32 py-3.5 md:py-5 rounded-xl bg-white/90 backdrop-blur-xl border border-white/10 text-slate-900 font-medium shadow-xl focus:ring-4 focus:ring-emerald-500/20 focus:bg-white outline-none transition-all text-base md:text-lg placeholder:text-slate-500"
              placeholder="Qu’est-ce que votre entreprise cherche ? (ex : café, emballages, entretien…)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Rechercher un produit ou un service"
            />

            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 md:px-6 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 text-sm md:text-base"
            >
              Trouver
            </button>
          </form>

          {/* TAGS POPULAIRES */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
            <span className="text-slate-400 text-xs md:text-sm font-semibold uppercase tracking-wider mr-2">
              Populaire :
            </span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/market?search=${encodeURIComponent(tag)}`)}
                className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs md:text-sm font-medium hover:bg-emerald-600/20 hover:text-white hover:border-emerald-500/50 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Mini preuve / bénéfices rapides */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-4xl">
            <MiniValue title="Gain de temps" desc="Tout est centralisé : comparez, trouvez et achetez plus rapidement." />
            <MiniValue title="Fournisseurs d’ici" desc="Encouragez l’économie locale et réduisez les frictions logistiques." />
            <MiniValue title="B2B simple" desc="Pensé pour les entreprises : besoins récurrents, achats pro, services." />
          </div>
        </div>
      </div>

      {/* --- POURQUOI FORFEO SUPPLY --- */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Pourquoi Forfeo Supply ?
          </h2>
          <p className="text-slate-500 mt-2 font-medium max-w-3xl mx-auto">
            Parce que trouver un bon fournisseur ne devrait pas prendre des heures. Forfeo Supply met en relation
            les acheteurs et tous les fournisseurs au même endroit, pour vous aider à acheter plus intelligemment.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          <ValueCard
            title="Tout centraliser"
            desc="Produits, équipements et services : évitez de jongler entre 10 sites, 10 contacts et 10 soumissions."
            icon="🧩"
          />
          <ValueCard
            title="Comparer plus vite"
            desc="Recherchez par besoin, filtrez, et trouvez les bonnes options en quelques clics."
            icon="⚡"
          />
          <ValueCard
            title="Acheter local"
            desc="Dénichez des fournisseurs du Québec et bâtissez des relations durables."
            icon="📍"
          />
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-xl md:text-2xl font-extrabold text-slate-900">
                Pour les acheteurs : achetez sans perdre de temps
              </h3>
              <p className="text-slate-600 mt-2 leading-relaxed">
                Que vous soyez un restaurant, un bureau, un commerce ou une entreprise de services, vous avez des achats récurrents.
                Forfeo Supply vous aide à trouver rapidement des fournisseurs pertinents selon ce que vous cherchez.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/market"
                  className="inline-flex justify-center items-center bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-3 rounded-xl transition"
                >
                  Voir le catalogue
                </Link>
                <button
                  type="button"
                  onClick={() => navigate('/market?search=')}
                  className="inline-flex justify-center items-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold px-5 py-3 rounded-xl transition"
                >
                  Lancer une recherche
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 md:p-6">
              <h4 className="font-extrabold text-slate-900">Comment ça marche ?</h4>
              <ol className="mt-3 space-y-3 text-slate-700">
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-extrabold">
                    1
                  </span>
                  <span>Recherchez un produit ou un service selon votre besoin.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-extrabold">
                    2
                  </span>
                  <span>Découvrez des fournisseurs et comparez les options.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-extrabold">
                    3
                  </span>
                  <span>Contactez/achetez plus simplement, et bâtissez vos relations B2B.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTEURS / CATEGORIES --- */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">Tout pour votre business</h2>
          <p className="text-slate-500 mt-2 font-medium">
            Explorez nos catégories principales, et trouvez rapidement ce dont vous avez besoin.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <CategoryCard title="Alimentaire & Vrac" icon="🥦" color="bg-green-50 text-green-600 border-green-100" />
          <CategoryCard title="Bureautique & TI" icon="💻" color="bg-blue-50 text-blue-600 border-blue-100" />
          <CategoryCard title="Équipement Pro" icon="⚙️" color="bg-orange-50 text-orange-600 border-orange-100" />
          <CategoryCard title="Services & Entretien" icon="🧹" color="bg-purple-50 text-purple-600 border-purple-100" />
        </div>

        <div className="text-center mt-10 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/market"
            className="inline-flex items-center justify-center gap-2 text-emerald-700 font-extrabold bg-emerald-50 px-6 py-3 rounded-xl hover:bg-emerald-100 transition"
          >
            Voir tout le catalogue
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => navigate('/merchant')}
            className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-extrabold px-6 py-3 rounded-xl hover:bg-slate-800 transition"
          >
            Ajouter mon entreprise
          </button>
        </div>
      </section>

      {/* --- FOOTER MINI CTA --- */}
      <section className="pb-16 md:pb-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl bg-slate-900 text-white p-8 md:p-10 overflow-hidden relative">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-black"></div>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-extrabold">
              Prêt à simplifier vos achats B2B ?
            </h2>
            <p className="text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Forfeo Supply met en relation tous les fournisseurs avec les acheteurs pour accélérer la recherche,
              la comparaison et la découverte de solutions locales.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/market"
                className="inline-flex justify-center items-center bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-xl transition shadow-md"
              >
                Explorer maintenant
              </Link>
              <button
                type="button"
                onClick={() => navigate('/merchant')}
                className="inline-flex justify-center items-center bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold px-6 py-3 rounded-xl transition"
              >
                Je suis fournisseur
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Mini cards (hero)
const MiniValue = ({ title, desc }) => (
  <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-4 text-left">
    <div className="text-white font-extrabold">{title}</div>
    <div className="text-slate-300 text-sm mt-1 leading-relaxed">{desc}</div>
  </div>
);

// Value section cards
const ValueCard = ({ title, desc, icon }) => (
  <div className="group p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
    <div className="text-3xl">{icon}</div>
    <h3 className="mt-3 font-extrabold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
      {title}
    </h3>
    <p className="mt-2 text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

// Catégories (fonctionnalité inchangée: Link -> /market)
const CategoryCard = ({ title, icon, color }) => (
  <Link
    to="/market"
    className={`group p-6 rounded-2xl shadow-sm hover:shadow-md border transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col items-center text-center ${color} hover:bg-white hover:border-emerald-200`}
  >
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
      {title}
    </h3>
  </Link>
);

export default Home;

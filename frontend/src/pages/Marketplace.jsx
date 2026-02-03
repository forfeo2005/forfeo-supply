import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtre existant (conservé)
  const [category, setCategory] = useState('Tout');

  // ✅ Ajouts UX (client-side, ne casse rien)
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance'); // relevance | price_asc | price_desc | stock_desc

  const { addToCart } = useCart();

  // Charger les VRAIS produits depuis Supabase (logique conservée)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      let query = supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .gt('stock', 0);

      if (category !== 'Tout') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) console.error('Erreur chargement produits:', error);
      else setProducts(data || []);

      setLoading(false);
    };

    fetchProducts();
  }, [category]);

  // ✅ Filtrage/tri côté client (aucun impact sur Supabase)
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    let list = [...products];

    if (term) {
      list = list.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const producer = (p.producer || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const unit = (p.unit || '').toLowerCase();
        return (
          name.includes(term) ||
          producer.includes(term) ||
          cat.includes(term) ||
          unit.includes(term)
        );
      });
    }

    // Tri
    if (sortBy === 'price_asc') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === 'stock_desc') {
      list.sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0));
    }
    // relevance = ordre “naturel” (aucun tri)
    return list;
  }, [products, searchTerm, sortBy]);

  const totalCount = filteredProducts.length;

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="container mx-auto px-6">

        {/* HERO vendeur */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1 rounded-full text-xs font-extrabold tracking-widest uppercase">
            Marketplace B2B • Québec
          </span>

          <h1 className="text-4xl font-extrabold text-slate-900 mt-4 mb-3">
            Le Marché Local Forfeo Supply
          </h1>

          <p className="text-slate-500 max-w-3xl mx-auto leading-relaxed">
            Ici, vous trouvez rapidement des produits, équipements et services pour votre entreprise.
            Forfeo Supply met en relation <span className="font-semibold">les acheteurs</span> et <span className="font-semibold">tous les fournisseurs</span>,
            afin de simplifier l’approvisionnement B2B au Québec.
          </p>

          {/* Mini bénéfices */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-5xl mx-auto">
            <MiniValue title="Centralisez vos achats" desc="Moins d’allers-retours, plus d’efficacité." />
            <MiniValue title="Trouvez plus vite" desc="Recherche + filtres + catégories B2B." />
            <MiniValue title="Encouragez le local" desc="Des fournisseurs d’ici, au même endroit." />
          </div>
        </div>

        {/* OUTILS : Recherche + Tri (client-side) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 md:p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center md:justify-between">
            <div className="flex-1">
              <label className="text-xs font-extrabold text-slate-700 tracking-widest uppercase">
                Rechercher
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ex : café, emballages, entretien, imprimante, service…"
                  className="w-full pl-11 pr-24 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition text-slate-900"
                />
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 transition"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            <div className="md:w-72">
              <label className="text-xs font-extrabold text-slate-700 tracking-widest uppercase">
                Trier
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-2 w-full py-3 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition font-semibold text-slate-900"
              >
                <option value="relevance">Pertinence</option>
                <option value="price_asc">Prix : bas → haut</option>
                <option value="price_desc">Prix : haut → bas</option>
                <option value="stock_desc">Stock : élevé → faible</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              {loading ? 'Chargement…' : (
                <>
                  <span className="font-extrabold text-slate-900">{totalCount}</span> résultat{totalCount > 1 ? 's' : ''}
                  {category !== 'Tout' ? (
                    <> dans <span className="font-semibold text-slate-700">{category}</span></>
                  ) : null}
                  {searchTerm.trim() ? (
                    <> pour “<span className="font-semibold text-slate-700">{searchTerm.trim()}</span>”</>
                  ) : null}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setCategory('Tout'); setSearchTerm(''); setSortBy('relevance'); }}
                className="text-sm font-extrabold px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
              >
                Réinitialiser
              </button>

              <Link
                to="/login"
                className="text-sm font-extrabold px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 hover:bg-emerald-100 transition"
              >
                Je suis fournisseur
              </Link>
            </div>
          </div>
        </div>

        {/* Filtres (conservés) */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {['Tout', 'Alimentaire', 'Bureau', 'Services', 'Équipement'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full font-extrabold transition ${
                category === cat
                  ? 'bg-forfeo-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grille de Produits */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse">
            Chargement des produits…
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-2xl border border-slate-100">
            <span className="text-4xl block mb-2">🔎</span>
            <p className="text-slate-600 font-bold">Aucun résultat trouvé.</p>
            <p className="text-slate-500 mt-2">
              Essayez un autre mot-clé ou changez de catégorie.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCategory('Tout'); }}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-extrabold transition"
              >
                Voir tout
              </button>
              <Link
                to="/login"
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-extrabold transition"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition group"
              >
                {/* Image Placeholder */}
                <div className="h-48 bg-slate-100 flex items-center justify-center text-4xl group-hover:bg-slate-50 transition">
                  {product.category === 'Alimentaire'
                    ? '🍎'
                    : product.category === 'Bureau'
                    ? '✏️'
                    : product.category === 'Services'
                    ? '🧰'
                    : '📦'}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-slate-100 text-slate-600 text-xs font-extrabold px-2 py-1 rounded uppercase">
                      {product.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Stock: {product.stock}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Par {product.producer || 'Fournisseur local'}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div className="font-mono font-extrabold text-xl text-forfeo-600">
                      {Number(product.price).toFixed(2)}$
                      <span className="text-xs text-slate-400 font-sans"> / {product.unit}</span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="bg-slate-900 hover:bg-forfeo-600 text-white px-4 py-3 rounded-xl transition shadow-lg active:scale-95 font-extrabold"
                      type="button"
                      aria-label={`Ajouter ${product.name} au panier`}
                    >
                      Ajouter +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA bas de page */}
        <div className="mt-14">
          <div className="rounded-2xl bg-slate-900 text-white p-8 md:p-10 overflow-hidden relative">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500 via-slate-900 to-black"></div>
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-extrabold">
                Vous êtes fournisseur ?
              </h2>
              <p className="text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Présentez vos produits et services aux entreprises d’ici.
                Forfeo Supply met en relation tous les fournisseurs avec les acheteurs pour accélérer la découverte et la collaboration.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-xl transition shadow-md"
                >
                  Créer un compte fournisseur
                </Link>
                <Link
                  to="/about"
                  className="inline-flex justify-center items-center bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold px-6 py-3 rounded-xl transition"
                >
                  Comprendre Forfeo Supply
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const MiniValue = ({ title, desc }) => (
  <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4 text-left">
    <div className="text-slate-900 font-extrabold">{title}</div>
    <div className="text-slate-600 text-sm mt-1 leading-relaxed">{desc}</div>
  </div>
);

export default Marketplace;

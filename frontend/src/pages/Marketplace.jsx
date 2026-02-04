// frontend/src/pages/Marketplace.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';

const CATEGORY_OPTIONS = ['Tout', 'Alimentaire', 'Bureau', 'Services', 'Équipement'];

const Marketplace = () => {
  const [products, setProducts] = useState([]);      // Toujours un tableau
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);          // Gestion d’erreur claire
  const [category, setCategory] = useState('Tout');

  const [searchParams] = useSearchParams();
  const rawSearchTerm = searchParams.get('search') || '';
  const searchTerm = rawSearchTerm.trim();

  // Contexte panier
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .gt('stock', 0);

        if (category !== 'Tout') {
          query = query.eq('category', category);
        }

        if (searchTerm) {
          // Recherche large sur name, producer, category
          // syntaxe Supabase : or("col.ilike.%term%,col2.ilike.%term%")
          const term = `%${searchTerm}%`;
          query = query.or(
            `name.ilike.${term},producer.ilike.${term},category.ilike.${term}`
          );
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur chargement produits:', err);
        setError(
          "Impossible de charger les produits pour le moment. Veuillez réessayer plus tard."
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchTerm]);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="container mx-auto px-6">

        {/* En-tête marché */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            Le Marché Forfeo Supply
          </h1>
          <p className="text-slate-500 max-w-3xl mx-auto text-sm sm:text-base">
            Marketplace B2B qui met en relation les{' '}
            <span className="font-semibold text-slate-800">fournisseurs locaux</span>{' '}
            et les <span className="font-semibold text-slate-800">acheteurs professionnels</span>.
            Centralisez vos achats, simplifiez votre logistique et soutenez l’économie d’ici.
          </p>

          {searchTerm && (
            <p className="mt-3 text-xs sm:text-sm text-slate-500">
              Résultats pour :{' '}
              <span className="font-semibold text-slate-800">“{searchTerm}”</span>
            </p>
          )}
        </div>

        {/* Filtres catégories */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                category === cat
                  ? 'bg-forfeo-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* États : loading / erreur / vide / liste */}
        {loading && (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse"
              >
                <div className="h-32 bg-slate-100 rounded-xl mb-4" />
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-2/3 mb-4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 bg-white rounded-2xl border border-red-100 max-w-2xl mx-auto">
            <span className="text-4xl mb-3 block">⚠️</span>
            <p className="text-red-500 font-semibold mb-2">Un problème est survenu.</p>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-bold hover:bg-forfeo-600 transition"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 max-w-2xl mx-auto">
            <span className="text-4xl block mb-2">🥕</span>
            {searchTerm ? (
              <>
                <p className="text-slate-700 font-semibold mb-2">
                  Aucun produit trouvé pour “{searchTerm}”.
                </p>
                <p className="text-slate-500 text-sm mb-4">
                  Essayez un terme plus général ou explorez une autre catégorie.
                </p>
              </>
            ) : (
              <>
                <p className="text-slate-700 font-semibold mb-2">
                  Aucun produit disponible dans cette catégorie pour le moment.
                </p>
                <p className="text-slate-500 text-sm">
                  De nouveaux fournisseurs locaux rejoignent Forfeo Supply chaque semaine.
                </p>
              </>
            )}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition group"
              >
                {/* Image / icône catégorie */}
                <div className="h-40 bg-slate-100 flex items-center justify-center text-4xl group-hover:bg-slate-50 transition">
                  {product.category === 'Alimentaire'
                    ? '🍎'
                    : product.category === 'Bureau'
                    ? '✏️'
                    : product.category === 'Services'
                    ? '🧹'
                    : '📦'}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-1 rounded uppercase">
                      {product.category || 'Divers'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Stock: {product.stock ?? 0}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Par {product.producer || 'Fournisseur local'}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div className="font-mono font-bold text-xl text-forfeo-600">
                      {(product.price ?? 0).toFixed(2)}$
                      <span className="text-xs text-slate-400 font-sans">
                        {' '}
                        / {product.unit || 'unité'}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="bg-slate-900 hover:bg-forfeo-600 text-white px-3 py-2 rounded-xl text-sm font-bold transition shadow-lg active:scale-95"
                    >
                      Ajouter +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Marketplace;

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const API_URL = 'https://forfeo-supply-api.onrender.com';

const Marketplace = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Chargement
  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, []);

  // Filtrage (Recherche + Catégorie)
  useEffect(() => {
    let result = products;

    // Filtre Recherche
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.producer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre Catégorie
    if (activeCategory !== 'Tout') {
      result = result.filter(p => p.category === activeCategory);
    }

    setFilteredProducts(result);
  }, [searchTerm, activeCategory, products]);

  // Commander (Simulation)
  const commander = (productName) => {
    alert(`🚀 Commande de ${productName} envoyée au fournisseur !`);
  };

  const categories = ['Tout', 'Légumes', 'Épicerie', 'Viande', 'Bureau', 'Services'];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header du Marché */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Le Marché Forfeo</h1>
            <p className="text-slate-500 mt-1">
              {filteredProducts.length} offres disponibles près de Québec
            </p>
          </div>
          
          {/* Barre de recherche locale */}
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Rechercher un produit ou service..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-forfeo-500 focus:border-transparent outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
          </div>
        </div>

        {/* Filtres Catégories */}
        <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-forfeo-600 text-white shadow-md transform scale-105' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grille Produits */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse">Chargement des offres...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">Aucun résultat trouvé pour "{searchTerm}".</p>
            <button onClick={() => {setSearchTerm(''); setActiveCategory('Tout');}} className="text-forfeo-600 font-bold mt-2 hover:underline">Réinitialiser les filtres</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <div key={p.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 flex flex-col">
                {/* Image Placeholder (pour l'instant une couleur) */}
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                  {p.category === 'Légumes' ? '🥦' : p.category === 'Bureau' ? '🖇️' : '📦'}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-forfeo-600 bg-forfeo-50 px-2 py-1 rounded-md">
                      {p.category}
                    </span>
                    <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      Local
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{p.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">Vendu par <span className="font-medium text-slate-700">{p.producer}</span></p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div>
                      <span className="block text-lg font-extrabold text-slate-900">{p.price} $</span>
                      <span className="text-xs text-slate-400">par {p.unit}</span>
                    </div>
                    <button 
                      onClick={() => commander(p.name)}
                      className="bg-slate-900 hover:bg-forfeo-600 text-white p-3 rounded-xl transition-colors shadow-lg"
                      title="Ajouter au panier"
                    >
                      🛒
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

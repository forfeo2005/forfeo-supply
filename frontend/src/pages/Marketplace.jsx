import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext'; // <--- IMPORT DU PANIER

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Tout');
  
  // Récupération de la fonction d'ajout au panier
  const { addToCart } = useCart(); 

  // Charger les VRAIS produits depuis Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('active', true) // On ne montre que les produits actifs
        .gt('stock', 0);    // Et qui ont du stock

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

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Le Marché Local</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Découvrez les produits frais disponibles directement auprès des producteurs de votre région.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['Tout', 'Alimentaire', 'Bureau', 'Services', 'Équipement'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full font-bold transition ${
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
          <div className="text-center py-20 text-slate-400 animate-pulse">Chargement des produits...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <span className="text-4xl block mb-2">🥕</span>
            <p className="text-slate-500">Aucun produit trouvé dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition group">
                {/* Image Placeholder (Car on ne gère pas encore les images uploadées) */}
                <div className="h-48 bg-slate-100 flex items-center justify-center text-4xl group-hover:bg-slate-50 transition">
                  {product.category === 'Alimentaire' ? '🍎' : 
                   product.category === 'Bureau' ? '✏️' : '📦'}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded uppercase">
                      {product.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Stock: {product.stock}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">Par {product.producer || 'Producteur local'}</p>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div className="font-mono font-bold text-xl text-forfeo-600">
                      {product.price}$ <span className="text-xs text-slate-400 font-sans">/ {product.unit}</span>
                    </div>
                    
                    <button 
                      onClick={() => addToCart(product)}
                      className="bg-slate-900 hover:bg-forfeo-600 text-white p-3 rounded-xl transition shadow-lg active:scale-95"
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

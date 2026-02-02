import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext'; // Pour ajouter au panier

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog'); // Par défaut : Le Catalogue
  const [user, setUser] = useState(null);
  
  // Données Catalogue
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUser(user);
      fetchProducts(); // On charge les produits dès l'arrivée
    };
    initData();
  }, [navigate]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .gt('stock', 0);
      
    if (!error) setProducts(data || []);
    setLoadingProducts(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-emerald-900 text-emerald-100 flex flex-col fixed h-full z-20 hidden md:flex">
        <div className="p-6 border-b border-emerald-800 flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <span className="font-bold text-white tracking-wide">Espace Acheteur</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} icon="🛒" label="Catalogue Fournisseurs" />
          <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon="📦" label="Mes Commandes" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="⚙️" label="Paramètres" />
        </nav>
        <div className="p-4 border-t border-emerald-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition text-sm font-medium">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        
        {/* --- VUE : CATALOGUE (PRIVE) --- */}
        {activeTab === 'catalog' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Catalogue Fournisseurs</h1>
              <button onClick={() => navigate('/cart')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow hover:bg-emerald-700 transition">
                Voir mon panier 🛒
              </button>
            </div>

            {loadingProducts ? (
               <div className="text-center py-10 text-slate-400">Chargement du catalogue...</div>
            ) : products.length === 0 ? (
               <div className="text-center py-10 bg-white rounded-xl shadow-sm">Aucun produit disponible pour le moment.</div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col">
                    <div className="h-32 bg-slate-100 flex items-center justify-center text-3xl">
                      {product.category === 'Alimentaire' ? '🥦' : '📦'}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800">{product.name}</h3>
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">{product.category}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">Vendu par {product.producer}</p>
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="font-mono font-bold text-lg">{product.price}$ <span className="text-xs text-slate-400">/{product.unit}</span></span>
                        <button 
                          onClick={() => addToCart(product)}
                          className="bg-slate-900 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-bold transition"
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
        )}

        {/* --- PLACEHOLDERS --- */}
        {activeTab === 'orders' && <div className="p-10 text-center text-slate-400">Historique des commandes à venir... 📦</div>}
        {activeTab === 'settings' && <div className="p-10 text-center text-slate-400">Paramètres du profil... ⚙️</div>}

      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
      active ? 'bg-emerald-700 text-white shadow-lg' : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

export default MerchantDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog');
  const [user, setUser] = useState(null);
  
  // Données
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]); // <--- NOUVEAU : État pour les commandes
  const [loading, setLoading] = useState(true);
  
  // Panier
  const { addToCart, cartCount } = useCart();

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUser(user);
      fetchData(user.id);
    };
    initData();
  }, [navigate]);

  const fetchData = async (userId) => {
    setLoading(true);
    
    // 1. Charger le Catalogue
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false });
    if (productsData) setProducts(productsData);

    // 2. Charger les Commandes de l'acheteur (NOUVEAU)
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select(`
        *,
        items: order_items (
          quantity,
          price_at_purchase,
          product: products (name)
        )
      `)
      .eq('buyer_id', userId) // Seules mes commandes
      .order('created_at', { ascending: false });

    if (error) console.error("Erreur commandes:", error);
    if (ordersData) setOrders(ordersData);

    setLoading(false);
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
        
        {/* --- VUE : CATALOGUE --- */}
        {activeTab === 'catalog' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Catalogue Fournisseurs</h1>
              <button onClick={() => navigate('/cart')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition flex items-center gap-3">
                <span>Voir mon panier 🛒</span>
                {cartCount > 0 && (
                  <span className="bg-white text-emerald-700 text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full">{cartCount}</span>
                )}
              </button>
            </div>

            {loading ? (
               <div className="text-center py-20 text-slate-400">Chargement...</div>
            ) : products.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
                 <div className="text-4xl mb-4">🥕</div>
                 <h3 className="text-xl font-bold text-slate-700">Le marché est vide.</h3>
               </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- VUE : MES COMMANDES (NOUVEAU) --- */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Mes Commandes</h1>
            
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-slate-100">
                  <div className="text-4xl mb-4">📦</div>
                  <h3 className="font-bold text-slate-700">Aucune commande passée</h3>
                  <button onClick={() => setActiveTab('catalog')} className="text-emerald-600 font-bold mt-2 hover:underline">Aller au catalogue</button>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50 p-4 flex justify-between items-center border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commande #{order.id.slice(0, 8)}</span>
                        <div className="text-xs text-slate-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="p-4">
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-700"><span className="font-bold">x{item.quantity}</span> {item.product?.name || 'Produit'}</span>
                            <span className="font-mono text-slate-500">{(item.price_at_purchase * item.quantity).toFixed(2)}$</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                        <span className="font-bold text-slate-900">Total</span>
                        <span className="font-bold text-xl text-emerald-700">{order.total_amount}$</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- VUE : PARAMÈTRES (Placeholder) --- */}
        {activeTab === 'settings' && <div className="p-10 text-center text-slate-400">Configuration du profil (Adresse, etc.) à venir... ⚙️</div>}

      </main>
    </div>
  );
};

// --- COMPOSANTS UI ---
const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    shipped: 'Expédiée 🚚',
    delivered: 'Livrée ✅',
    cancelled: 'Annulée'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
};

const ProductCard = ({ product, onAdd }) => {
  const [added, setAdded] = useState(false);
  const handleClick = () => { onAdd(product); setAdded(true); setTimeout(() => setAdded(false), 1000); };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col">
      <div className="h-32 bg-slate-100 flex items-center justify-center text-3xl">
        {product.category === 'Alimentaire' ? '🥦' : '📦'}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-800">{product.name}</h3>
        <p className="text-xs text-slate-500 mb-4">Vendu par {product.producer || 'Fournisseur'}</p>
        <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-50">
           <span className="font-mono font-bold">{product.price}$ <span className="text-xs text-slate-400">/{product.unit}</span></span>
           <button onClick={handleClick} disabled={added} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${added ? 'bg-green-500 text-white' : 'bg-slate-900 text-white hover:bg-emerald-600'}`}>
             {added ? 'Ajouté ✅' : 'Ajouter +'}
           </button>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${active ? 'bg-emerald-700 text-white shadow-lg' : 'text-emerald-200 hover:bg-emerald-800'}`}>
    <span>{icon}</span><span>{label}</span>
  </button>
);

export default MerchantDashboard;

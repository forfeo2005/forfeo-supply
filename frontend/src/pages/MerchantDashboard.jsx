import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';

// --- ICÔNES SVG (Légers et rapides) ---
const Icons = {
  Menu: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Cart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Box: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Star: () => <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
};

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Données
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres & Recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [sortBy, setSortBy] = useState('priceAsc'); // Par défaut : Moins cher

  // Profil
  const [profile, setProfile] = useState({ company_name: '', address_line1: '', city: '', state: 'QC', postal_code: '', phone: '' });
  const [saving, setSaving] = useState(false);

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
    // Catalogue (Tous les produits actifs)
    const { data: productsData } = await supabase.from('products').select('*').eq('active', true).gt('stock', 0);
    if (productsData) setProducts(productsData);
    
    // Commandes
    const { data: ordersData } = await supabase.from('orders').select(`*, items: order_items (quantity, price_at_purchase, product: products (name))`).eq('buyer_id', userId).order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);
    
    // Profil
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profileData) setProfile({ company_name: profileData.company_name || '', address_line1: profileData.address_line1 || '', city: profileData.city || '', state: profileData.state || 'QC', postal_code: profileData.postal_code || '', phone: profileData.phone || '' });
    setLoading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
    if (error) alert("Erreur: " + error.message); else alert("Profil sauvegardé ! ✅");
    setSaving(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/'); };

  // --- LOGIQUE DE TRI INTELLIGENT ---
  // Calcul du prix minimum par catégorie pour le badge
  const getMinPrice = (cat) => {
    const prods = products.filter(p => p.category === cat);
    return prods.length ? Math.min(...prods.map(p => p.price)) : 0;
  };

  const filteredProducts = products
    .filter(p => selectedCategory === 'Tout' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const categories = ['Tout', 'Alimentaire', 'Bureau', 'Équipement', 'Services', 'Autre'];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row text-slate-900">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-emerald-900 text-white z-30 flex justify-between items-center p-4 shadow-md">
        <span className="font-bold text-lg flex items-center gap-2">🌱 Forfeo Market</span>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/cart')} className="relative">
            <Icons.Cart />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">{cartCount}</span>}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}</button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-72 bg-emerald-900 text-emerald-50 transform transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col shadow-2xl`}>
        <div className="p-8 border-b border-emerald-800 hidden md:flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <div><h2 className="font-bold text-xl text-white">Forfeo</h2><p className="text-xs text-emerald-300 font-bold uppercase">Espace Acheteur</p></div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-20 md:mt-4">
          <NavButton active={activeTab === 'catalog'} onClick={() => {setActiveTab('catalog'); setMobileMenuOpen(false)}} icon={<Icons.Box />} label="Marché Local" />
          <NavButton active={activeTab === 'orders'} onClick={() => {setActiveTab('orders'); setMobileMenuOpen(false)}} icon={<Icons.Cart />} label="Mes Commandes" />
          <NavButton active={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setMobileMenuOpen(false)}} icon={<Icons.User />} label="Mon Profil" />
        </nav>
        <div className="p-6 border-t border-emerald-800">
           <button onClick={() => navigate('/cart')} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white p-3 rounded-xl font-bold flex items-center justify-between shadow-lg mb-4 transition">
              <span className="flex items-center gap-2 text-emerald-900"><Icons.Cart /> Panier</span>
              {cartCount > 0 && <span className="bg-white text-emerald-900 text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full">{cartCount}</span>}
           </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/20 text-emerald-200 rounded-xl transition text-sm"><Icons.Logout /> Déconnexion</button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen bg-slate-50">
        
        {activeTab === 'catalog' && (
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Le Marché Local</h1>
              <p className="text-slate-500">Comparez les prix en temps réel.</p>
            </header>

            {/* FILTRES & RECHERCHE */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 sticky top-0 z-10 border border-slate-100">
              <div className="relative flex-1">
                <div className="absolute left-3 top-3 text-slate-400"><Icons.Search /></div>
                <input type="text" placeholder="Rechercher (pommes, services...)" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <select className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="priceAsc">💰 Prix croissant (Moins cher)</option>
                <option value="priceDesc">💎 Prix décroissant</option>
                <option value="recent">📅 Plus récents</option>
              </select>
            </div>

            {/* TAGS CATÉGORIES */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${selectedCategory === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500'}`}>{cat}</button>
              ))}
            </div>

            {/* GRILLE PRODUITS */}
            {loading ? <div className="text-center py-20 text-slate-400">Chargement...</div> : filteredProducts.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl shadow-sm"><div className="text-6xl mb-4">🥕</div><h3 className="text-xl font-bold text-slate-700">Aucun produit trouvé.</h3></div> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const isBestPrice = product.price === getMinPrice(product.category) && product.price > 0;
                  return (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all flex flex-col h-full group relative">
                       {isBestPrice && <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-full shadow-sm flex items-center gap-1 z-10"><Icons.Star /> MEILLEUR PRIX</div>}
                       <div className="h-40 bg-slate-50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                         {product.category === 'Alimentaire' ? '🥦' : product.category === 'Bureau' ? '✏️' : product.category === 'Services' ? '🔧' : '📦'}
                       </div>
                       <div className="p-5 flex-1 flex flex-col">
                         <div className="flex justify-between items-start mb-2"><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{product.category}</span></div>
                         <h3 className="font-bold text-lg text-slate-800 mb-1">{product.name}</h3>
                         <p className="text-xs text-slate-500 mb-4">Vendu par {product.producer || 'Fournisseur'}</p>
                         <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div><span className="block text-xs text-slate-400">Prix</span><span className="font-bold text-xl text-slate-900">{product.price}$ <span className="text-sm font-normal text-slate-400">/{product.unit}</span></span></div>
                            <button onClick={() => {addToCart(product); alert("Ajouté !")}} className="h-10 px-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-emerald-600 transition shadow-md flex items-center gap-2">Ajouter +</button>
                         </div>
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- COMMANDES --- */}
        {activeTab === 'orders' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Mes Commandes</h1>
            <div className="space-y-4">
               {orders.length === 0 ? <div className="bg-white p-12 rounded-2xl text-center shadow-sm"><p className="font-bold text-slate-500">Aucune commande.</p></div> : orders.map(o => (
                 <div key={o.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                   <div>
                     <div className="flex items-center gap-3 mb-1"><span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">#{o.id.slice(0,8)}</span></div>
                     <p className="text-sm text-slate-500">{new Date(o.created_at).toLocaleDateString()}</p>
                   </div>
                   <div className="flex-1 md:px-8"><p className="text-sm font-medium text-slate-700">{o.items.length} article(s)</p></div>
                   <div className="text-right"><p className="text-xl font-bold text-emerald-700">{o.total_amount.toFixed(2)}$</p></div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* --- PARAMÈTRES --- */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Mon Profil</h1>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Entreprise</label><input type="text" className="w-full p-4 border rounded-xl" value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} placeholder="Nom de l'entreprise" /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Adresse</label><input type="text" className="w-full p-4 border rounded-xl" value={profile.address_line1} onChange={e => setProfile({...profile, address_line1: e.target.value})} placeholder="Adresse" /></div>
                <div className="grid grid-cols-2 gap-4">
                   <input type="text" className="w-full p-4 border rounded-xl" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} placeholder="Ville" />
                   <input type="text" className="w-full p-4 border rounded-xl" value={profile.postal_code} onChange={e => setProfile({...profile, postal_code: e.target.value})} placeholder="Code Postal" />
                </div>
                <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition shadow-lg">{saving ? '...' : 'Sauvegarder'}</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-emerald-800 text-white shadow-lg translate-x-1' : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white'}`}>
    <div className={active ? 'text-white' : 'text-emerald-300'}>{icon}</div><span>{label}</span>
  </button>
);

export default MerchantDashboard;

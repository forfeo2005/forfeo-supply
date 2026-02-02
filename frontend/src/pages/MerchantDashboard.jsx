import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';

// --- ICÔNES SVG (Pour éviter d'installer une librairie) ---
const Icons = {
  Menu: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Cart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Box: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
  
  // --- FILTRES & RECHERCHE (NOUVEAU) ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [sortBy, setSortBy] = useState('recent'); // recent, priceAsc, priceDesc

  // PROFIL
  const [profile, setProfile] = useState({
    company_name: '', address_line1: '', city: '', state: 'QC', postal_code: '', phone: ''
  });
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
    
    // 1. Charger Catalogue
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false });
    if (productsData) setProducts(productsData);

    // 2. Charger Commandes
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`*, items: order_items (quantity, price_at_purchase, product: products (name))`)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);

    // 3. Charger Profil
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profileData) {
      setProfile({
        company_name: profileData.company_name || '',
        address_line1: profileData.address_line1 || '',
        city: profileData.city || '',
        state: profileData.state || 'QC',
        postal_code: profileData.postal_code || '',
        phone: profileData.phone || ''
      });
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
    if (error) alert("Erreur: " + error.message);
    else alert("Profil mis à jour ! ✅");
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // --- LOGIQUE DE TRI ET FILTRAGE ---
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
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* MOBILE HEADER (Visible seulement sur mobile) */}
      <div className="md:hidden fixed top-0 w-full bg-emerald-900 text-white z-30 flex justify-between items-center p-4 shadow-md">
        <span className="font-bold text-lg tracking-wide flex items-center gap-2">🌱 Forfeo Market</span>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/cart')} className="relative">
            <Icons.Cart />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">{cartCount}</span>}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
          </button>
        </div>
      </div>

      {/* SIDEBAR (Responsive) */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-72 bg-emerald-900 text-emerald-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col shadow-2xl`}>
        <div className="p-8 border-b border-emerald-800 hidden md:flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <div>
             <h2 className="font-bold text-xl text-white tracking-wide">Forfeo</h2>
             <p className="text-xs text-emerald-300 uppercase font-bold tracking-wider">Espace Acheteur</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-20 md:mt-4">
          <NavButton active={activeTab === 'catalog'} onClick={() => {setActiveTab('catalog'); setMobileMenuOpen(false)}} icon={<Icons.Box />} label="Marché Local" />
          <NavButton active={activeTab === 'orders'} onClick={() => {setActiveTab('orders'); setMobileMenuOpen(false)}} icon={<Icons.Cart />} label="Mes Commandes" />
          <NavButton active={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setMobileMenuOpen(false)}} icon={<Icons.User />} label="Mon Profil" />
        </nav>

        <div className="p-6 border-t border-emerald-800">
           <button onClick={() => navigate('/cart')} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white p-3 rounded-xl font-bold flex items-center justify-between shadow-lg mb-4 transition-transform active:scale-95 group">
              <span className="flex items-center gap-2 text-emerald-900"><Icons.Cart /> Panier</span>
              {cartCount > 0 && <span className="bg-white text-emerald-900 text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full shadow-sm group-hover:scale-110 transition">{cartCount}</span>}
           </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition text-sm font-medium text-emerald-200">
            <Icons.Logout /> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen bg-slate-50">
        
        {/* --- VUE : CATALOGUE --- */}
        {activeTab === 'catalog' && (
          <div className="animate-fade-in max-w-7xl mx-auto">
            <header className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Le Marché Local</h1>
              <p className="text-slate-500">Comparez les prix et soutenez les producteurs d'ici.</p>
            </header>

            {/* BARRE DE RECHERCHE & FILTRES (Sticky) */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 md:top-0 z-10">
              <div className="relative w-full md:w-96">
                <div className="absolute left-3 top-3 text-slate-400"><Icons.Search /></div>
                <input 
                  type="text" 
                  placeholder="Rechercher (pommes, papier...)" 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                <select 
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm outline-none cursor-pointer hover:bg-slate-100 transition"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">📅 Plus récents</option>
                  <option value="priceAsc">💰 Prix croissant (Moins cher)</option>
                  <option value="priceDesc">💎 Prix décroissant</option>
                </select>
              </div>
            </div>

            {/* CATEGORIES (Chips) */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                    selectedCategory === cat 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* GRILLE PRODUITS */}
            {loading ? (
               <div className="text-center py-20 text-slate-400 animate-pulse">Chargement des étals...</div>
            ) : filteredProducts.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                 <div className="text-6xl mb-4">🥕</div>
                 <h3 className="text-xl font-bold text-slate-700">Aucun produit trouvé.</h3>
                 <p className="text-slate-400 mt-2">Essayez une autre recherche ou catégorie.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- VUE : COMMANDES --- */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Historique des Commandes</h1>
            <div className="space-y-4">
               {orders.length === 0 ? (
                 <div className="bg-white p-12 rounded-2xl text-center border border-slate-100 shadow-sm">
                    <div className="text-4xl mb-4 text-slate-300">📦</div>
                    <p className="font-bold text-slate-500">Vous n'avez pas encore commandé.</p>
                    <button onClick={() => setActiveTab('catalog')} className="text-emerald-600 font-bold mt-2 hover:underline">Aller au marché</button>
                 </div>
               ) : orders.map(o => (
                 <div key={o.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">#{o.id.slice(0,8)}</span>
                        <StatusBadge status={o.status}/>
                     </div>
                     <p className="text-sm text-slate-500">{new Date(o.created_at).toLocaleDateString()}</p>
                   </div>
                   <div className="flex-1 md:px-8">
                      <p className="text-sm font-medium text-slate-700">
                        {o.items.length} article(s) • <span className="text-slate-400">{o.items.map(i => i.product?.name).join(', ').slice(0, 30)}...</span>
                      </p>
                   </div>
                   <div className="text-right w-full md:w-auto flex justify-between md:block items-center">
                     <p className="text-xl font-bold text-emerald-700">{o.total_amount.toFixed(2)}$</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* --- VUE : PARAMÈTRES --- */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Mon Profil Acheteur</h1>
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100">
              
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom de l'entreprise / Restaurant</label>
                  <input type="text" className="w-full p-3 md:p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                    value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} placeholder="Ex: Le Petit Bistro" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Téléphone</label>
                    <input type="text" className="w-full p-3 md:p-4 border border-slate-200 rounded-xl bg-slate-50" 
                      value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="514-555-0199" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">📍 Adresse de Livraison</h3>
                   <div className="space-y-4">
                      <input type="text" required className="w-full p-3 md:p-4 border border-slate-200 rounded-xl bg-slate-50" 
                        value={profile.address_line1} onChange={e => setProfile({...profile, address_line1: e.target.value})} placeholder="123 Rue Principale" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="col-span-2 md:col-span-1">
                          <input type="text" required className="w-full p-3 md:p-4 border border-slate-200 rounded-xl bg-slate-50" 
                            value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} placeholder="Ville" />
                        </div>
                        <select className="w-full p-3 md:p-4 border border-slate-200 rounded-xl bg-slate-50" value={profile.state} onChange={e => setProfile({...profile, state: e.target.value})}>
                          <option value="QC">Québec</option><option value="ON">Ontario</option><option value="NB">Nouveau-Brunswick</option>
                        </select>
                        <input type="text" required className="w-full p-3 md:p-4 border border-slate-200 rounded-xl bg-slate-50" 
                          value={profile.postal_code} onChange={e => setProfile({...profile, postal_code: e.target.value})} placeholder="Code Postal" />
                      </div>
                   </div>
                </div>

                <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition shadow-lg mt-4 flex justify-center items-center gap-2">
                  {saving ? 'Enregistrement...' : 'Sauvegarder mes informations 💾'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// --- COMPOSANTS UI MODERNES ---
const ProductCard = ({ product, onAdd }) => {
  const [added, setAdded] = useState(false);
  
  const handleClick = () => { onAdd(product); setAdded(true); setTimeout(() => setAdded(false), 1500); };
  
  const getIcon = (cat) => {
    if(cat === 'Alimentaire') return '🥦';
    if(cat === 'Bureau') return '✏️';
    if(cat === 'Équipement') return '🚜';
    if(cat === 'Services') return '🔧';
    return '📦';
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
       <div className="h-40 bg-slate-50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
         {getIcon(product.category)}
       </div>
       <div className="p-5 flex-1 flex flex-col">
         <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{product.category}</span>
            {product.stock < 10 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">Plus que {product.stock} !</span>}
         </div>
         <h3 className="font-bold text-lg text-slate-800 mb-1 leading-tight">{product.name}</h3>
         <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
           <span className="opacity-50">Vendu par</span> 
           <span className="font-semibold text-slate-700">{product.producer || 'Fournisseur'}</span>
         </p>
         
         <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <div>
               <span className="block text-xs text-slate-400">Prix unitaire</span>
               <span className="font-bold text-xl text-slate-900">{product.price}$ <span className="text-sm font-normal text-slate-400">/{product.unit}</span></span>
            </div>
            <button 
              onClick={handleClick} 
              disabled={added}
              className={`h-10 px-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 ${added ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-slate-900 text-white hover:bg-emerald-600 active:scale-95'}`}
            >
              {added ? 'Ajouté !' : <><span className="text-lg">+</span> Ajouter</>}
            </button>
         </div>
       </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = { pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700' };
  const labels = { pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée' };
  return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100'}`}>{labels[status] || status}</span>;
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-emerald-800 text-white shadow-lg translate-x-1' : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white'}`}>
    <div className={active ? 'text-white' : 'text-emerald-300'}>{icon}</div>
    <span>{label}</span>
  </button>
);

export default MerchantDashboard;

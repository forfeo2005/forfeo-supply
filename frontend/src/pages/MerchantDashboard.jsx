import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';
import { Menu, X, Search, Filter, ShoppingBag, User, FileText, LogOut } from 'lucide-react'; // Assure-toi d'installer lucide-react si nécessaire, sinon remplace par des emojis

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Données
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres & Recherche (NOUVEAU)
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

  // Logique de filtrage
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
    <div className="min-h-screen bg-gray-50 font-sans flex text-slate-900">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed w-full bg-emerald-900 text-white z-30 flex justify-between items-center p-4 shadow-md">
        <span className="font-bold text-xl tracking-wide">Forfeo Market</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* SIDEBAR (Desktop & Mobile) */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-emerald-900 text-emerald-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col shadow-2xl`}>
        <div className="p-8 border-b border-emerald-800 hidden md:flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <div>
             <h2 className="font-bold text-xl text-white tracking-wide">Forfeo</h2>
             <p className="text-xs text-emerald-300 uppercase font-bold tracking-wider">Espace Acheteur</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-16 md:mt-4">
          <NavButton active={activeTab === 'catalog'} onClick={() => {setActiveTab('catalog'); setMobileMenuOpen(false)}} icon={<ShoppingBag size={20}/>} label="Marché Local" />
          <NavButton active={activeTab === 'orders'} onClick={() => {setActiveTab('orders'); setMobileMenuOpen(false)}} icon={<FileText size={20}/>} label="Mes Commandes" />
          <NavButton active={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setMobileMenuOpen(false)}} icon={<User size={20}/>} label="Mon Profil" />
        </nav>

        <div className="p-4 border-t border-emerald-800">
           <button onClick={() => navigate('/cart')} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl font-bold flex items-center justify-between shadow-lg mb-4 transition-transform active:scale-95">
              <span className="flex items-center gap-2"><ShoppingBag size={18}/> Panier</span>
              {cartCount > 0 && <span className="bg-white text-emerald-700 text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full">{cartCount}</span>}
           </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition text-sm font-medium text-emerald-200">
            <LogOut size={18}/> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        
        {/* --- CATALOGUE --- */}
        {activeTab === 'catalog' && (
          <div className="animate-fade-in max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Le Marché Local</h1>
              <p className="text-slate-500">Comparez et achetez les meilleurs produits locaux.</p>
            </header>

            {/* BARRE DE RECHERCHE & FILTRES */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-white/90">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher des pommes, du papier..." 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <select 
                  className="p-3 bg-slate-50 rounded-xl font-medium text-sm border-none outline-none cursor-pointer hover:bg-slate-100 transition"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">📅 Plus récents</option>
                  <option value="priceAsc">💰 Prix croissant</option>
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
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                    selectedCategory === cat 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* GRILLE PRODUITS */}
            {loading ? (
               <div className="text-center py-20 text-slate-400">Chargement des étals...</div>
            ) : filteredProducts.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
                 <div className="text-6xl mb-4">🥕</div>
                 <h3 className="text-xl font-bold text-slate-700">Aucun produit trouvé.</h3>
                 <p className="text-slate-400">Essayez une autre recherche.</p>
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

        {/* --- COMMANDES --- */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Historique des Commandes</h1>
            <div className="space-y-4">
               {orders.length === 0 ? (
                 <div className="bg-white p-12 rounded-2xl text-center border border-slate-100">
                    <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4"/>
                    <p className="font-bold text-slate-500">Vous n'avez pas encore commandé.</p>
                 </div>
               ) : orders.map(o => (
                 <div key={o.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">#{o.id.slice(0,8)}</span>
                        <StatusBadge status={o.status}/>
                     </div>
                     <p className="text-sm text-slate-500">{new Date(o.created_at).toLocaleDateString()}</p>
                   </div>
                   <div className="flex-1 md:px-8">
                      <p className="text-sm font-medium text-slate-700">
                        {o.items.length} article(s) • <span className="text-slate-400">{o.items.map(i => i.product?.name).join(', ').slice(0, 30)}...</span>
                      </p>
                   </div>
                   <div className="text-right">
                     <p className="text-xl font-bold text-emerald-700">{o.total_amount.toFixed(2)}$</p>
                     <button className="text-xs text-slate-400 underline hover:text-emerald-600">Voir détails</button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* --- PARAMÈTRES --- */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Mon Profil Acheteur</h1>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-3xl">👤</div>
                <div>
                  <h2 className="font-bold text-lg">{profile.company_name || 'Nouvel Utilisateur'}</h2>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nom de l'entreprise / Restaurant</label>
                  <input type="text" className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition" 
                    value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} placeholder="Ex: Le Petit Bistro" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Téléphone</label>
                    <input type="text" className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50" 
                      value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="514-555-0199" />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50">
                   <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">📍 Adresse de Livraison</h3>
                   <div className="space-y-4">
                      <input type="text" required className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50" 
                        value={profile.address_line1} onChange={e => setProfile({...profile, address_line1: e.target.value})} placeholder="123 Rue Principale" />
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="col-span-2 md:col-span-1">
                          <input type="text" required className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50" 
                            value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} placeholder="Ville" />
                        </div>
                        <select className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50" value={profile.state} onChange={e => setProfile({...profile, state: e.target.value})}>
                          <option value="QC">Québec</option><option value="ON">Ontario</option><option value="NB">Nouveau-Brunswick</option>
                        </select>
                        <input type="text" required className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50" 
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

// --- COMPOSANTS UI MODERNISÉS ---
const ProductCard = ({ product, onAdd }) => {
  const [added, setAdded] = useState(false);
  
  const handleClick = () => { onAdd(product); setAdded(true); setTimeout(() => setAdded(false), 1500); };
  
  // Emoji par défaut selon catégorie
  const getIcon = (cat) => {
    if(cat === 'Alimentaire') return '🥦';
    if(cat === 'Bureau') return '✏️';
    if(cat === 'Équipement') return '🚜';
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
            <span className="text-xs text-slate-400">Stock: {product.stock}</span>
         </div>
         <h3 className="font-bold text-lg text-slate-800 mb-1 leading-tight">{product.name}</h3>
         <p className="text-xs text-slate-500 mb-4">Vendu par <span className="font-medium text-slate-700">{product.producer || 'Fournisseur Certifié'}</span></p>
         
         <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
            <div>
               <span className="block text-xs text-slate-400">Prix unitaire</span>
               <span className="font-bold text-xl text-slate-900">{product.price}$ <span className="text-sm font-normal text-slate-400">/{product.unit}</span></span>
            </div>
            <button 
              onClick={handleClick} 
              disabled={added}
              className={`h-10 px-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 ${added ? 'bg-emerald-100 text-emerald-700 w-full justify-center' : 'bg-slate-900 text-white hover:bg-emerald-600'}`}
            >
              {added ? 'Ajouté !' : 'Ajouter +'}
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
    {icon} <span>{label}</span>
  </button>
);

export default MerchantDashboard;

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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // PROFIL (Nouveau state pour le formulaire)
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
      .eq('active', true).gt('stock', 0).order('created_at', { ascending: false });
    if (productsData) setProducts(productsData);

    // 2. Charger Commandes
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`*, items: order_items (quantity, price_at_purchase, product: products (name))`)
      .eq('buyer_id', userId).order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);

    // 3. Charger Profil (NOUVEAU)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
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

  // SAUVEGARDER LE PROFIL
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id);
      
    if (error) alert("Erreur: " + error.message);
    else alert("Profil mis à jour avec succès ! ✅");
    setSaving(false);
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
          <NavButton active={activeTab === 'catalog'} onClick={() => setActiveTab('catalog')} icon="🛒" label="Catalogue" />
          <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon="📦" label="Mes Commandes" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="⚙️" label="Mon Profil" />
        </nav>
        <div className="p-4 border-t border-emerald-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/10 hover:text-red-200 rounded-xl transition text-sm font-medium">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        
        {/* --- CATALOGUE --- */}
        {activeTab === 'catalog' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Catalogue Fournisseurs</h1>
              <button onClick={() => navigate('/cart')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition flex items-center gap-3">
                <span>Voir mon panier 🛒</span>
                {cartCount > 0 && <span className="bg-white text-emerald-700 text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full">{cartCount}</span>}
              </button>
            </div>
            {/* ... Code catalogue identique ... */}
            {loading ? <div className="text-center py-20 text-slate-400">Chargement...</div> : products.length === 0 ? <div className="text-center bg-white p-10 rounded-xl">Le marché est vide.</div> : (
              <div className="grid md:grid-cols-3 gap-6">{products.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}</div>
            )}
          </div>
        )}

        {/* --- COMMANDES --- */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Mes Commandes</h1>
            <div className="space-y-4">
               {/* ... Code commandes identique ... */}
               {orders.length === 0 ? <div className="bg-white p-10 rounded-xl text-center">Aucune commande.</div> : orders.map(o => (
                 <div key={o.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
                   <div className="flex justify-between font-bold mb-2"><span>#{o.id.slice(0,8)}</span><StatusBadge status={o.status}/></div>
                   <div>Total: {o.total_amount}$</div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* --- PARAMÈTRES (NOUVEAU !!!) --- */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Mon Profil & Livraison</h1>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nom de l'entreprise / Restaurant</label>
                  <input type="text" className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none" 
                    value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} placeholder="Ex: Le Petit Bistro" />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Téléphone</label>
                    <input type="text" className="w-full p-3 border rounded-xl bg-slate-50" 
                      value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="514-555-0199" />
                  </div>
                </div>

                <hr className="border-slate-100" />
                
                <h3 className="font-bold text-slate-900 flex items-center gap-2">📍 Adresse de Livraison</h3>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Adresse (Ligne 1)</label>
                  <input type="text" required className="w-full p-3 border rounded-xl bg-slate-50" 
                    value={profile.address_line1} onChange={e => setProfile({...profile, address_line1: e.target.value})} placeholder="123 Rue Principale" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ville</label>
                    <input type="text" required className="w-full p-3 border rounded-xl bg-slate-50" 
                      value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} placeholder="Montréal" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Province</label>
                    <select className="w-full p-3 border rounded-xl bg-slate-50" value={profile.state} onChange={e => setProfile({...profile, state: e.target.value})}>
                      <option value="QC">Québec</option>
                      <option value="ON">Ontario</option>
                      <option value="NB">Nouveau-Brunswick</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Code Postal</label>
                    <input type="text" required className="w-full p-3 border rounded-xl bg-slate-50" 
                      value={profile.postal_code} onChange={e => setProfile({...profile, postal_code: e.target.value})} placeholder="H1A 1A1" />
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

// --- Petits composants UI ---
const ProductCard = ({ product, onAdd }) => {
  const [added, setAdded] = useState(false);
  const handleClick = () => { onAdd(product); setAdded(true); setTimeout(() => setAdded(false), 1000); };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition flex flex-col p-4">
       <h3 className="font-bold">{product.name}</h3>
       <p className="text-sm text-slate-500 mb-2">{product.price}$ / {product.unit}</p>
       <button onClick={handleClick} className={`mt-auto px-4 py-2 rounded-lg text-sm font-bold text-white transition ${added ? 'bg-green-500' : 'bg-slate-900'}`}>{added ? 'Ajouté ✅' : 'Ajouter +'}</button>
    </div>
  );
};

const StatusBadge = ({ status }) => <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded uppercase font-bold">{status}</span>;

const NavButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${active ? 'bg-emerald-700 text-white shadow-lg' : 'text-emerald-200 hover:bg-emerald-800'}`}>
    <span>{icon}</span><span>{label}</span>
  </button>
);

export default MerchantDashboard;

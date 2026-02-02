import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  
  // Données
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // PROFIL FOURNISSEUR (Nouveau : pour l'adresse de départ)
  const [profile, setProfile] = useState({
    company_name: '', address_line1: '', city: '', state: 'QC', postal_code: '', phone: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Formulaire d'ajout produit
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: 'Alimentaire', unit: 'kg' });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUser(user);
      fetchData(user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchData = async (userId) => {
    setLoading(true);
    
    // 1. Charger les produits
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('supplier_id', userId)
      .order('created_at', { ascending: false });
      
    if (productsData) setProducts(productsData);

    // 2. Charger les commandes (AMÉLIORÉ : On récupère l'adresse de l'acheteur)
    const { data: ordersData, error } = await supabase
      .from('orders')
      .select(`
        *,
        buyer: profiles (email, role, company_name, address_line1, city, state, postal_code, phone),
        items: order_items (
          quantity,
          price_at_purchase,
          product: products (name, unit)
        )
      `)
      .eq('supplier_id', userId)
      .order('created_at', { ascending: false });

    if (error) console.error("Erreur commandes:", error);
    if (ordersData) setOrders(ordersData);

    // 3. Charger le Profil Fournisseur (NOUVEAU)
    const { data: profileData } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
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

  // --- ACTIONS PRODUITS ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('products')
      .insert([{
        supplier_id: user.id,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        unit: newProduct.unit,
        active: true
      }]);

    if (error) {
      alert('Erreur: ' + error.message);
    } else {
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', stock: '', category: 'Alimentaire', unit: 'kg' });
      fetchData(user.id);
    }
  };

  const deleteProduct = async (id) => {
    if(!confirm("Supprimer ce produit ?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData(user.id);
  };

  // --- ACTIONS COMMANDES ---
  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) alert("Erreur mise à jour: " + error.message);
    else fetchData(user.id);
  };

  // --- ACTION ÉTIQUETTE (NOUVEAU) ---
  const handlePrintLabel = (order) => {
    if (!profile.address_line1 || !order.buyer?.address_line1) {
      alert("⚠️ Impossible de générer l'étiquette.\n\nVérifiez que VOTRE adresse (onglet Paramètres) et l'adresse du CLIENT sont complètes.");
      return;
    }
    // Simulation (en attendant Shippo)
    alert(`🖨️ Simulation d'impression...\n\nDépart: ${profile.city}\nArrivée: ${order.buyer.city}\nArticles: ${order.items.length}`);
  };

  // --- SAUVEGARDE PROFIL (NOUVEAU) ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
    if (error) alert("Erreur: " + error.message);
    else alert("Profil mis à jour ! ✅");
    setSavingProfile(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // --- COMPOSANTS UI ---
  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20 hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <span className="font-bold text-white tracking-wide">Espace Pro</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📊" label="Vue d'ensemble" />
          <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon="📦" label="Ma Boutique" />
          
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition font-medium ${
              activeTab === 'orders' ? 'bg-forfeo-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span>🚚</span>
              <span>Commandes</span>
            </div>
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>

          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="⚙️" label="Paramètres" />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-800 rounded-xl transition text-sm mb-2">
            <span>🏠</span> Retour site public
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition text-sm font-medium">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        
        {/* --- ONGLET : VUE D'ENSEMBLE --- */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Bonjour, {user?.email} 👋</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Chiffre d'affaires" value={`${orders.reduce((acc, o) => acc + o.total_amount, 0).toFixed(2)}$`} icon="💰" color="bg-emerald-100 text-emerald-600" />
              <StatCard title="Commandes en attente" value={orders.filter(o => o.status === 'pending').length} icon="⏳" color="bg-amber-100 text-amber-600" />
              <StatCard title="Produits actifs" value={products.length} icon="📦" color="bg-blue-100 text-blue-600" />
            </div>

            {/* ALERTE ADRESSE MANQUANTE */}
            {!profile.address_line1 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-sm flex justify-between items-center animate-pulse">
                <div>
                  <p className="font-bold text-amber-800">Configuration requise ⚠️</p>
                  <p className="text-sm text-amber-700">Vous devez ajouter votre adresse d'expédition pour pouvoir imprimer des étiquettes.</p>
                </div>
                <button onClick={() => setActiveTab('settings')} className="bg-white text-amber-700 font-bold px-4 py-2 rounded shadow-sm hover:bg-amber-100">Configurer</button>
              </div>
            )}
          </div>
        )}

        {/* --- ONGLET : MES PRODUITS --- */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Ma Boutique Locale</h1>
              <button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition flex items-center gap-2">
                <span>+</span> Ajouter un produit
              </button>
            </div>

            {/* Formulaire Ajout */}
            {showAddForm && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-8 animate-slide-up">
                <h3 className="font-bold text-lg mb-4">Nouveau Produit</h3>
                <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom du produit" required className="p-3 border rounded-xl bg-slate-50"
                    value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                  />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Prix" required className="p-3 border rounded-xl bg-slate-50 w-full"
                      value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
                    />
                    <select className="p-3 border rounded-xl bg-slate-50"
                      value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>
                      <option value="kg">/ kg</option><option value="unité">/ unité</option><option value="lb">/ lb</option><option value="lit">/ litre</option>
                    </select>
                  </div>
                  <input type="number" placeholder="Stock disponible" required className="p-3 border rounded-xl bg-slate-50"
                    value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} 
                  />
                  <select className="p-3 border rounded-xl bg-slate-50"
                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    <option value="Alimentaire">Alimentaire</option><option value="Bureau">Bureau</option><option value="Équipement">Équipement</option>
                  </select>
                  <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                    <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-500 font-bold">Annuler</button>
                    <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold">Sauvegarder</button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste Produits */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Produit</th><th className="p-4">Prix</th><th className="p-4">Stock</th><th className="p-4">État</th><th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400">Aucun produit.</td></tr>
                  ) : products.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-bold text-slate-900">{product.name} <span className="text-xs font-normal text-slate-400 ml-2">({product.category})</span></td>
                      <td className="p-4 font-mono">{product.price}$ <span className="text-xs text-slate-400">/{product.unit}</span></td>
                      <td className="p-4 font-mono">{product.stock}</td>
                      <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">ACTIF</span></td>
                      <td className="p-4 text-right">
                        <button onClick={() => deleteProduct(product.id)} className="text-red-400 hover:text-red-600 font-bold text-sm">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ONGLET : COMMANDES --- */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Gestion des Commandes</h1>
            
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-slate-100">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-slate-700">Aucune commande pour le moment</h3>
                  <p className="text-slate-400 mt-2">Dès qu'un client achète vos produits, ils apparaîtront ici.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
                    
                    {/* En-tête de la commande */}
                    <div className="bg-slate-50 p-6 flex flex-wrap justify-between items-center gap-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-xs text-slate-400">#{order.id.slice(0, 8)}</span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="font-bold text-slate-900">
                          {order.buyer?.company_name || order.buyer?.email || 'Client inconnu'}
                        </div>
                        {/* Affiche l'adresse si disponible */}
                        <div className="text-xs text-slate-500">
                           {order.buyer?.city ? `📍 ${order.buyer.city}, ${order.buyer.state}` : 'Adresse non renseignée'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                          <span className="block text-xs text-slate-400 uppercase font-bold">Total</span>
                          <span className="font-mono text-xl font-bold text-slate-900">{order.total_amount}$</span>
                        </div>
                        
                        {/* Actions */}
                        {order.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition">
                              Accepter
                            </button>
                          </div>
                        )}
                        {/* Une fois confirmé, on peut imprimer et expédier */}
                        {order.status === 'confirmed' && (
                          <div className="flex gap-2">
                            <button onClick={() => handlePrintLabel(order)} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition">
                              <span>🖨️</span> Étiquette
                            </button>
                            <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition">
                              Expédier
                            </button>
                          </div>
                        )}
                        {order.status === 'shipped' && (
                          <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition">
                            Confirmer Livraison ✅
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Détail des produits */}
                    <div className="p-6 bg-white">
                      <ul className="space-y-3">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                              <span className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded text-sm">x{item.quantity}</span>
                              <span className="font-medium text-slate-800">{item.product?.name || 'Produit supprimé'}</span>
                            </div>
                            <span className="font-mono text-slate-500 text-sm">
                              {(item.price_at_purchase * item.quantity).toFixed(2)}$
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- ONGLET : PARAMÈTRES (NOUVEAU) --- */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Paramètres Expédition</h1>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nom de l'entreprise</label>
                    <input type="text" className="w-full p-3 border rounded-xl bg-slate-50" value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} placeholder="Ferme Exemple" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Adresse de départ (Expéditeur)</label>
                    <input type="text" required className="w-full p-3 border rounded-xl bg-slate-50" value={profile.address_line1} onChange={e => setProfile({...profile, address_line1: e.target.value})} placeholder="123 Rang des Patates" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Ville</label>
                      <input type="text" required className="w-full p-3 border rounded-xl bg-slate-50" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} placeholder="Ville" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Prov.</label>
                      <select className="w-full p-3 border rounded-xl bg-slate-50" value={profile.state} onChange={e => setProfile({...profile, state: e.target.value})}>
                          <option value="QC">QC</option><option value="ON">ON</option><option value="NB">NB</option>
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Code Postal</label>
                      <input type="text" required className="w-full p-3 border rounded-xl bg-slate-50" value={profile.postal_code} onChange={e => setProfile({...profile, postal_code: e.target.value})} placeholder="A1A 1A1" />
                  </div>
                </div>
                <button type="submit" disabled={savingProfile} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition shadow-lg mt-4">
                    {savingProfile ? '...' : 'Sauvegarder l\'adresse de départ'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

// Petit composant bouton navigation
const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
      active ? 'bg-forfeo-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

// Petit composant carte statistique
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;

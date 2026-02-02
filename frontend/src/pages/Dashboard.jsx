import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { jsPDF } from "jspdf"; 
import { Menu, X, Package, ShoppingCart, Settings, Trash2, Printer, FileText, Plus, LogOut, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Données
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // PROFIL
  const [profile, setProfile] = useState({
    company_name: '', address_line1: '', city: '', state: 'QC', postal_code: '', phone: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Formulaire Ajout Produit
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
    
    // 1. Profil (Important pour le nom du producteur)
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

    // 2. Produits
    const { data: productsData } = await supabase
      .from('products').select('*').eq('supplier_id', userId).order('created_at', { ascending: false });
    if (productsData) setProducts(productsData);

    // 3. Commandes
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`*, buyer: profiles (email, company_name, address_line1, city, state, postal_code), items: order_items (quantity, price_at_purchase, product: products (name, unit))`)
      .eq('supplier_id', userId).order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);

    setLoading(false);
  };

  // --- FONCTION : GÉNÉRER FACTURE PDF (Québec) ---
  const generateInvoice = (order) => {
    const doc = new jsPDF();
    const TPS_RATE = 0.05;
    const TVQ_RATE = 0.09975;

    // En-tête
    doc.setFontSize(20);
    doc.text("FACTURE", 150, 20);
    doc.setFontSize(12);
    doc.text(`Fournisseur: ${profile.company_name || user.email}`, 20, 20);
    doc.text(`Adresse: ${profile.address_line1 || 'N/A'}, ${profile.city || ''}`, 20, 26);
    
    doc.line(20, 35, 190, 35);

    // Infos Client & Commande
    doc.text(`Client: ${order.buyer?.company_name || order.buyer?.email || 'Client invité'}`, 20, 45);
    doc.text(`Commande #: ${order.id.slice(0, 8)}`, 150, 45);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 150, 52);

    // Tableau Produits
    let y = 70;
    doc.setFont("helvetica", "bold");
    doc.text("Description", 20, y);
    doc.text("Qté", 100, y);
    doc.text("Prix", 130, y);
    doc.text("Total", 160, y);
    doc.line(20, y+2, 190, y+2);
    doc.setFont("helvetica", "normal");

    let subtotal = 0;
    order.items.forEach(item => {
      y += 10;
      const lineTotal = item.quantity * item.price_at_purchase;
      subtotal += lineTotal;
      doc.text(item.product?.name || "Article", 20, y);
      doc.text(item.quantity.toString(), 100, y);
      doc.text(item.price_at_purchase.toFixed(2) + "$", 130, y);
      doc.text(lineTotal.toFixed(2) + "$", 160, y);
    });

    // Calcul Taxes
    const tps = subtotal * TPS_RATE;
    const tvq = subtotal * TVQ_RATE;
    const total = subtotal + tps + tvq;

    y += 20;
    doc.line(100, y, 190, y);
    y += 10;
    doc.text("Sous-total:", 130, y); doc.text(subtotal.toFixed(2) + "$", 170, y);
    y += 8;
    doc.text("TPS (5%):", 130, y); doc.text(tps.toFixed(2) + "$", 170, y);
    y += 8;
    doc.text("TVQ (9.975%):", 130, y); doc.text(tvq.toFixed(2) + "$", 170, y);
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", 130, y); doc.text(total.toFixed(2) + " CAD", 170, y);

    doc.save(`Facture_${order.id.slice(0,8)}.pdf`);
  };

  // --- ACTIONS PRODUITS ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    // CORRECTION ERREUR "NULL VALUE": On force une valeur si profile vide
    const producerName = profile.company_name || user.email || "Fournisseur Forfeo"; 

    const { error } = await supabase.from('products').insert([{
        supplier_id: user.id,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        unit: newProduct.unit,
        active: true,
        producer: producerName
    }]);

    if (error) alert('Erreur: ' + error.message);
    else {
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', stock: '', category: 'Alimentaire', unit: 'kg' });
      fetchData(user.id);
    }
  };

  const deleteProduct = async (id) => {
    if(!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if(error) alert("Erreur suppression: " + error.message);
    else fetchData(user.id);
  };

  // --- ACTIONS COMMANDES ---
  const updateOrderStatus = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    fetchData(user.id);
  };

  const handlePrintLabel = async (order) => {
    if (!profile.address_line1 || !order.buyer?.address_line1) {
      alert("⚠️ Adresses incomplètes pour l'étiquette."); return;
    }
    if(!confirm("Générer l'étiquette Shippo ?")) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/create-label`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: order.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.open(data.label_url, '_blank');
      updateOrderStatus(order.id, 'shipped');
    } catch (err) { alert("Erreur étiquette: " + err.message); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id);
    if (error) alert("Erreur: " + error.message);
    else alert("Profil sauvegardé !");
    setSavingProfile(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex text-slate-900">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-30 flex justify-between items-center p-4 shadow-md">
        <span className="font-bold text-lg">⚡ Espace Pro</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col shadow-xl`}>
        <div className="p-8 border-b border-slate-800 hidden md:block">
          <h2 className="font-bold text-xl text-white">Forfeo Supply</h2>
          <p className="text-xs text-slate-500 mt-1">Gestion Fournisseur</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-20 md:mt-4">
          <NavButton active={activeTab === 'overview'} onClick={() => {setActiveTab('overview'); setMobileMenuOpen(false)}} icon={<TrendingUp size={20}/>} label="Vue d'ensemble" />
          <NavButton active={activeTab === 'products'} onClick={() => {setActiveTab('products'); setMobileMenuOpen(false)}} icon={<Package size={20}/>} label="Ma Boutique" />
          <NavButton active={activeTab === 'orders'} onClick={() => {setActiveTab('orders'); setMobileMenuOpen(false)}} icon={<ShoppingCart size={20}/>} label="Commandes" badge={orders.filter(o => o.status === 'pending').length} />
          <NavButton active={activeTab === 'settings'} onClick={() => {setActiveTab('settings'); setMobileMenuOpen(false)}} icon={<Settings size={20}/>} label="Paramètres" />
        </nav>
        <div className="p-6 border-t border-slate-800">
           <button onClick={() => navigate('/')} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-800 rounded-xl transition text-sm mb-2"><span>🏠</span> Site Public</button>
           <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-900/30 text-red-400 rounded-xl transition text-sm"><LogOut size={18}/> Déconnexion</button>
        </div>
      </aside>

      {/* CONTENU */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        
        {/* VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Bonjour, {profile.company_name || 'Partenaire'} 👋</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Chiffre d'affaires" value={`${orders.reduce((acc, o) => acc + o.total_amount, 0).toFixed(2)}$`} icon="💰" color="bg-emerald-100 text-emerald-600" />
              <StatCard title="Commandes à traiter" value={orders.filter(o => o.status === 'pending').length} icon="⏳" color="bg-amber-100 text-amber-600" />
              <StatCard title="Produits en vente" value={products.length} icon="📦" color="bg-blue-100 text-blue-600" />
            </div>
            {!profile.address_line1 && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r flex justify-between items-center shadow-sm">
                <div><p className="font-bold text-amber-800">Profil incomplet ⚠️</p><p className="text-sm text-amber-700">Configurez votre adresse pour expédier.</p></div>
                <button onClick={() => setActiveTab('settings')} className="bg-white text-amber-700 font-bold px-4 py-2 rounded shadow hover:bg-amber-100">Configurer</button>
              </div>
            )}
          </div>
        )}

        {/* MA BOUTIQUE */}
        {activeTab === 'products' && (
          <div className="animate-fade-in max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Mon Inventaire</h1>
              <button onClick={() => setShowAddForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2"><Plus size={20}/> Ajouter</button>
            </div>

            {showAddForm && (
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-8">
                <h3 className="font-bold text-lg mb-4">Nouveau Produit</h3>
                <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom du produit" required className="p-3 border rounded-xl" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <div className="flex gap-2">
                    <input type="number" placeholder="Prix" required className="p-3 border rounded-xl w-full" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                    <select className="p-3 border rounded-xl" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}><option value="kg">/ kg</option><option value="unité">/ unité</option><option value="lb">/ lb</option><option value="lit">/ litre</option></select>
                  </div>
                  <input type="number" placeholder="Stock" required className="p-3 border rounded-xl" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                  <select className="p-3 border rounded-xl" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    <option value="Alimentaire">Alimentaire</option><option value="Bureau">Bureau</option><option value="Équipement">Équipement</option>
                    <option value="Services">Services</option><option value="Autre">Autre</option>
                  </select>
                  <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-500 font-bold">Annuler</button>
                    <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold">Sauvegarder</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold"><tr><th className="p-4">Produit</th><th className="p-4">Prix</th><th className="p-4">Stock</th><th className="p-4">État</th><th className="p-4 text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {products.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-slate-400">Aucun produit.</td></tr> : products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50"><td className="p-4 font-bold">{p.name} <span className="text-xs font-normal text-slate-400 ml-2">({p.category})</span></td><td className="p-4 font-mono">{p.price}$ /{p.unit}</td><td className="p-4 font-mono">{p.stock}</td><td className="p-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">ACTIF</span></td><td className="p-4 text-right"><button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* COMMANDES */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">Commandes</h1>
            <div className="space-y-6">
              {orders.length === 0 ? <div className="bg-white p-12 rounded-2xl text-center border border-slate-100"><h3 className="font-bold text-slate-500">Aucune commande pour le moment.</h3></div> : orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-slate-50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-3 mb-1"><span className="font-mono text-xs text-slate-500">#{order.id.slice(0, 8)}</span><StatusBadge status={order.status} /></div>
                      <div className="font-bold text-slate-800">{order.buyer?.company_name || 'Client'}</div>
                      <div className="text-xs text-slate-500">{order.buyer?.city ? `📍 ${order.buyer.city}` : 'Adresse non renseignée'}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="mr-4 text-right"><span className="block text-xs text-slate-400 font-bold">TOTAL</span><span className="font-mono text-xl font-bold">{order.total_amount}$</span></div>
                      <button onClick={() => generateInvoice(order)} className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg text-sm font-bold flex gap-2 hover:bg-slate-50 transition"><span>📄</span> Facture</button>
                      {order.status === 'confirmed' && <button onClick={() => handlePrintLabel(order)} className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-bold flex gap-2 hover:bg-slate-700"><span>🖨️</span> Étiquette</button>}
                      {/* Boutons d'état */}
                      {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'confirmed')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700">Accepter</button>}
                      {order.status === 'confirmed' && <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700">Expédier</button>}
                      {order.status === 'shipped' && <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700">Livré</button>}
                    </div>
                  </div>
                  <div className="p-6"><ul className="space-y-2">{order.items.map((item, i) => <li key={i} className="flex justify-between text-sm"><span className="font-medium text-slate-700">x{item.quantity} {item.product?.name}</span><span className="font-mono text-slate-500">{(item.price_at_purchase * item.quantity).toFixed(2)}$</span></li>)}</ul></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARAMÈTRES */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Paramètres</h1>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Nom de l'entreprise</label><input type="text" className="w-full p-3 border rounded-xl" value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} placeholder="Ferme Exemple" /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Adresse</label><input type="text" className="w-full p-3 border rounded-xl" value={profile.address_line1} onChange={e => setProfile({...profile, address_line1: e.target.value})} placeholder="123 Rue Principale" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Ville</label><input type="text" className="w-full p-3 border rounded-xl" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Code Postal</label><input type="text" className="w-full p-3 border rounded-xl" value={profile.postal_code} onChange={e => setProfile({...profile, postal_code: e.target.value})} /></div>
                </div>
                <button type="submit" disabled={savingProfile} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition shadow-lg">{savingProfile ? '...' : 'Sauvegarder'}</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- SUBS ---
const NavButton = ({ active, onClick, icon, label, badge }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition font-medium ${active ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
    <div className="flex items-center gap-3"><span>{icon}</span><span>{label}</span></div>
    {badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}
  </button>
);
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div>
    <div><p className="text-slate-500 text-sm font-medium">{title}</p><p className="text-2xl font-bold text-slate-900">{value}</p></div>
  </div>
);
const StatusBadge = ({ status }) => {
  const styles = { pending: 'bg-amber-100 text-amber-800', confirmed: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800' };
  const labels = { pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée' };
  return <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${styles[status]}`}>{labels[status] || status}</span>;
};

export default Dashboard;

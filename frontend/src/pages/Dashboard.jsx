import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { jsPDF } from "jspdf"; 
import { Menu, X, Package, ShoppingCart, Settings, Trash2, Plus, LogOut, TrendingUp, Printer, FileText, Users, Image as ImageIcon } from 'lucide-react';

// BANQUE D'IMAGES STANDARD
const STOCK_IMAGES = {
  default: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=400&q=80',
  vegetables: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=400&q=80',
  fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
  meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&q=80',
  office: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&q=80',
  equipment: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&q=80'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]); // NOUVEAU
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({ company_name: '', address_line1: '', city: '', state: 'QC', postal_code: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: 'Alimentaire', unit: 'kg', image_type: 'vegetables' });

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
    // 1. Profil
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profileData) setProfile({ ...profileData });

    // 2. Produits
    const { data: productsData } = await supabase.from('products').select('*').eq('supplier_id', userId).eq('active', true).order('created_at', { ascending: false });
    if (productsData) setProducts(productsData);

    // 3. Commandes
    const { data: ordersData } = await supabase.from('orders').select(`*, buyer: profiles (id, email, company_name, address_line1, city, phone), items: order_items (quantity, price_at_purchase, product: products (name, unit))`).eq('supplier_id', userId).order('created_at', { ascending: false });
    if (ordersData) {
      setOrders(ordersData);
      // Extraire Clients Uniques
      const uniqueClients = [];
      const map = new Map();
      for (const order of ordersData) {
        if(order.buyer && !map.has(order.buyer.id)){
            map.set(order.buyer.id, true);
            uniqueClients.push(order.buyer);
        }
      }
      setClients(uniqueClients);
    }
    setLoading(false);
  };

  // --- ACTIONS PRODUITS ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const producerName = profile.company_name || user.email || "Fournisseur";
    const imageUrl = STOCK_IMAGES[newProduct.image_type] || STOCK_IMAGES.default;

    const { error } = await supabase.from('products').insert([{
        supplier_id: user.id,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        unit: newProduct.unit,
        active: true,
        producer: producerName,
        image_url: imageUrl // SAUVEGARDE IMAGE
    }]);

    if (error) alert('Erreur: ' + error.message);
    else {
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', stock: '', category: 'Alimentaire', unit: 'kg', image_type: 'vegetables' });
      fetchData(user.id);
    }
  };

  const deleteProduct = async (id) => {
    if(!confirm("Supprimer ?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if(error) { await supabase.from('products').update({ active: false }).eq('id', id); }
    fetchData(user.id);
  };

  const generateInvoice = (order) => {
    const doc = new jsPDF();
    const TPS = 0.05, TVQ = 0.09975;
    
    doc.setFontSize(20); doc.text("FACTURE", 150, 20);
    doc.setFontSize(10); doc.text(order.payment_term === 'pay_now' ? "PAYÉ (Escompte 2%)" : "NET 30 JOURS", 150, 28);

    doc.setFontSize(12); doc.text(`Fournisseur: ${profile.company_name || user.email}`, 20, 20);
    doc.line(20, 35, 190, 35);
    doc.text(`Client: ${order.buyer?.company_name || order.buyer?.email}`, 20, 45);
    doc.text(`Commande #: ${order.id.slice(0, 8)}`, 150, 45);

    let y = 70;
    doc.setFont("helvetica", "bold"); doc.text("Desc", 20, y); doc.text("Total", 160, y); doc.line(20, y+2, 190, y+2);
    doc.setFont("helvetica", "normal");

    let subtotal = 0;
    order.items.forEach(item => {
      y += 10; subtotal += item.quantity * item.price_at_purchase;
      doc.text(item.product?.name || "Article", 20, y); doc.text((item.quantity * item.price_at_purchase).toFixed(2) + "$", 160, y);
    });

    const total = subtotal * (1 + TPS + TVQ);
    y += 20; doc.line(100, y, 190, y); y += 10;
    doc.text(`TOTAL (inc. taxes): ${total.toFixed(2)} CAD`, 120, y);
    doc.save(`Facture_${order.id.slice(0,8)}.pdf`);
  };

  const handlePrintLabel = async (order) => {
    if (!profile.address_line1 || !order.buyer?.address_line1) { alert("Adresses incomplètes"); return; }
    if(!confirm("Générer étiquette ?")) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/create-label`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: order.id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.open(data.label_url, '_blank');
    } catch (err) { alert("Erreur: " + err.message); }
  };

  const handleSaveProfile = async (e) => { e.preventDefault(); setSavingProfile(true); await supabase.from('profiles').update(profile).eq('id', user.id); alert("Sauvegardé !"); setSavingProfile(false); };
  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-20 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col shadow-xl`}>
        <div className="p-8 border-b border-slate-800 hidden md:block"><h2 className="font-bold text-xl text-white">Forfeo Supply</h2></div>
        <nav className="flex-1 p-4 space-y-2 mt-20 md:mt-4">
          <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<TrendingUp size={20}/>} label="Vue d'ensemble" />
          <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={20}/>} label="Ma Boutique" />
          <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingCart size={20}/>} label="Commandes" badge={orders.filter(o => o.status === 'pending').length} />
          <NavButton active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} icon={<Users size={20}/>} label="Mes Clients" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label="Paramètres" />
        </nav>
        <div className="p-6 border-t border-slate-800"><button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-900/30 text-red-400 rounded-xl transition text-sm">Déconnexion</button></div>
      </aside>

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Bonjour, {profile.company_name || 'Partenaire'} 👋</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Chiffre d'affaires" value={`${orders.reduce((acc, o) => acc + o.total_amount, 0).toFixed(2)}$`} icon={<ShoppingCart size={24}/>} color="bg-emerald-100 text-emerald-600" />
              <StatCard title="Commandes à traiter" value={orders.filter(o => o.status === 'pending').length} icon={<Package size={24}/>} color="bg-amber-100 text-amber-600" />
              <StatCard title="Clients actifs" value={clients.length} icon={<Users size={24}/>} color="bg-blue-100 text-blue-600" />
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8"><h1 className="text-2xl font-bold">Mon Inventaire</h1><button onClick={() => setShowAddForm(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex gap-2"><Plus size={20}/> Ajouter</button></div>
            {showAddForm && (
              <div className="bg-white p-6 rounded-xl shadow-sm mb-8 animate-fade-in">
                <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom" required className="p-3 border rounded" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  <div className="flex gap-2"><input type="number" placeholder="Prix" required className="p-3 border rounded w-full" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /><select className="p-3 border rounded" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}><option value="kg">kg</option><option value="unité">unité</option></select></div>
                  <input type="number" placeholder="Stock" required className="p-3 border rounded" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                  
                  {/* SÉLECTEUR D'IMAGE */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Choisir une image</label>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {Object.keys(STOCK_IMAGES).map(type => (
                        <div key={type} onClick={() => setNewProduct({...newProduct, image_type: type})} 
                             className={`cursor-pointer border-2 rounded-xl overflow-hidden min-w-[80px] h-20 relative ${newProduct.image_type === type ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-100'}`}>
                           <img src={STOCK_IMAGES[type]} className="w-full h-full object-cover" alt={type} />
                           <p className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] text-center capitalize">{type}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <select className="p-3 border rounded md:col-span-2" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option value="Alimentaire">Alimentaire</option><option value="Bureau">Bureau</option><option value="Équipement">Équipement</option></select>
                  <button type="submit" className="md:col-span-2 bg-slate-900 text-white p-3 rounded font-bold">Sauvegarder</button>
                </form>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full text-left"><thead><tr className="bg-slate-50"><th className="p-4">Img</th><th className="p-4">Produit</th><th className="p-4">Prix</th><th className="p-4">Stock</th><th className="p-4">Action</th></tr></thead><tbody>{products.map(p => (<tr key={p.id} className="border-t"><td className="p-4"><img src={p.image_url || STOCK_IMAGES.default} className="w-10 h-10 rounded object-cover"/></td><td className="p-4 font-bold">{p.name}</td><td className="p-4">{p.price}$</td><td className="p-4">{p.stock}</td><td className="p-4"><button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="max-w-6xl mx-auto"><h1 className="text-2xl font-bold mb-8">Commandes</h1><div className="space-y-4">{orders.map(o => (<div key={o.id} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4"><div><span className="font-bold">#{o.id.slice(0,8)}</span> <span className="ml-2 text-sm text-slate-500">{o.buyer?.company_name}</span><div className="mt-1">{o.payment_term === 'pay_now' ? <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">Payé (Escompte)</span> : <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Net 30 Jours</span>}</div></div><div className="flex gap-2"><button onClick={() => generateInvoice(o)} className="bg-slate-100 px-3 py-2 rounded text-sm font-bold flex gap-2"><FileText size={16}/> Facture</button>{o.status === 'confirmed' && <button onClick={() => handlePrintLabel(o)} className="bg-slate-800 text-white px-3 py-2 rounded text-sm font-bold flex gap-2"><Printer size={16}/> Étiquette</button>}</div></div>))}</div></div>
        )}

        {activeTab === 'clients' && (
          <div className="max-w-6xl mx-auto"><h1 className="text-2xl font-bold mb-8">Mes Clients</h1><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{clients.map(c => (<div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition"><div className="flex items-center gap-4 mb-4"><div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl">🏢</div><div><h3 className="font-bold text-slate-800">{c.company_name || 'Entreprise'}</h3><p className="text-xs text-slate-500">{c.email}</p></div></div><div className="text-sm text-slate-600"><p>📍 {c.city || 'Ville inconnue'}</p><p>📞 {c.phone || '--'}</p></div></div>))}</div></div>
        )}

        {activeTab === 'settings' && <div className="max-w-2xl mx-auto"><div className="bg-white p-8 rounded-xl shadow-sm"><form onSubmit={handleSaveProfile} className="space-y-4"><input type="text" placeholder="Nom Entreprise" className="w-full p-3 border rounded" value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} /><button type="submit" disabled={savingProfile} className="w-full bg-emerald-600 text-white p-3 rounded font-bold">Sauvegarder</button></form></div></div>}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, badge }) => <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${active ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}><div className="flex items-center gap-3">{icon}<span>{label}</span></div>{badge > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>}</button>;
const StatCard = ({ title, value, icon, color }) => <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4"><div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div><div><p className="text-slate-500 text-sm font-medium">{title}</p><p className="text-2xl font-bold text-slate-900">{value}</p></div></div>;

export default Dashboard;

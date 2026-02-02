import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { jsPDF } from "jspdf"; 
import { Menu, X, Package, ShoppingCart, Settings, Trash2, Plus, LogOut, TrendingUp, Printer, FileText } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Données
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profil
  const [profile, setProfile] = useState({ company_name: '', address_line1: '', city: '', state: 'QC', postal_code: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Formulaire Ajout
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

  // --- TON FETCHDATA ROBUSTE (Réparé pour éviter erreur 400) ---
  const fetchData = async (userId) => {
    setLoading(true);
    try {
      // 1. Profil
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
        .from('products')
        .select('*')
        .eq('supplier_id', userId)
        .eq('active', true)
        .order('created_at', { ascending: false });
        
      if (productsData) setProducts(productsData);

      // 3. Commandes (Ta requête sécurisée)
      const { data: ordersData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!buyer_id (email, company_name, address_line1, city, state, postal_code),
          items:order_items (
            quantity, 
            price_at_purchase, 
            product:products (name, unit)
          )
        `)
        .eq('supplier_id', userId)
        .order('created_at', { ascending: false });

      if (orderError) {
        console.error("Erreur chargement commandes:", orderError);
      } else {
        setOrders(ordersData || []);
      }

    } catch (e) {
      console.error("Erreur générale:", e);
    } finally {
      setLoading(false);
    }
  };

  // --- FACTURE PDF ---
  const generateInvoice = (order) => {
    const doc = new jsPDF();
    const TPS_RATE = 0.05;
    const TVQ_RATE = 0.09975;

    doc.setFontSize(20); doc.text("FACTURE", 150, 20);
    doc.setFontSize(12); doc.text(`Fournisseur: ${profile.company_name || user.email}`, 20, 20);
    doc.text(`Adresse: ${profile.address_line1 || ''}, ${profile.city || ''}`, 20, 26);
    doc.line(20, 35, 190, 35);

    doc.text(`Client: ${order.buyer?.company_name || order.buyer?.email || 'Client'}`, 20, 45);
    doc.text(`Commande #: ${order.id.slice(0, 8)}`, 150, 45);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 150, 52);

    let y = 70;
    doc.setFont("helvetica", "bold");
    doc.text("Description", 20, y); doc.text("Qté", 100, y); doc.text("Prix", 130, y); doc.text("Total", 160, y);
    doc.line(20, y+2, 190, y+2);
    doc.setFont("helvetica", "normal");

    let subtotal = 0;
    order.items.forEach(item => {
      y += 10;
      const lineTotal = item.quantity * item.price_at_purchase;
      subtotal += lineTotal;
      doc.text(item.product?.name || "Article supprimé", 20, y);
      doc.text(item.quantity.toString(), 100, y);
      doc.text(item.price_at_purchase.toFixed(2) + "$", 130, y);
      doc.text(lineTotal.toFixed(2) + "$", 160, y);
    });

    const tps = subtotal * TPS_RATE;
    const tvq = subtotal * TVQ_RATE;
    const total = subtotal + tps + tvq;

    y += 20; doc.line(100, y, 190, y); y += 10;
    doc.text("Sous-total:", 130, y); doc.text(subtotal.toFixed(2) + "$", 170, y);
    y += 8; doc.text("TPS (5%):", 130, y); doc.text(tps.toFixed(2) + "$", 170, y);
    y += 8; doc.text("TVQ (9.975%):", 130, y); doc.text(tvq.toFixed(2) + "$", 170, y);
    y += 10; doc.setFont("helvetica", "bold"); doc.text("TOTAL:", 130, y); doc.text(total.toFixed(2) + " CAD", 170, y);

    doc.save(`Facture_${order.id.slice(0,8)}.pdf`);
  };

  // --- ACTIONS PRODUITS (Correctif Producer Null) ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const producerName = profile.company_name || user.email || "Fournisseur";

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

  // --- SUPPRESSION INTELLIGENTE ---
  const deleteProduct = async (id) => {
    if(!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    
    // Si erreur 409 (clé étrangère), on archive au lieu de supprimer
    if (error) {
       console.log("Impossible de supprimer définitivement (déjà commandé), archivage...");
       await supabase.from('products').update({ active: false }).eq('id', id);
    }
    fetchData(user.id);
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

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSavingProfile(true);
    await supabase.from('profiles').update(profile).eq('id', user.id);
    alert("Profil sauvegardé !"); setSavingProfile(false);
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
      <aside className={`fixed inset-y-0 left-0 z-20 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col shadow-xl`}>
        <div className="p-8 border-b border-slate-800 hidden md:block"><h2 className="font-bold text-xl text-white">Forfeo Supply</h2></div>
        <nav className="flex-1 p-4 space-y-2 mt-20 md:mt-4">
          <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<TrendingUp size={20}/>} label="Vue d'ensemble" />
          <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package size={20}/>} label="Ma Boutique" />
          <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingCart size={20}/>} label="Commandes" badge={orders.length} />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label="Paramètres" />
        </nav>
        <div className="p-6 border-t border-slate-800"><button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-900/30 text-red-400 rounded-xl transition text-sm"><LogOut size={18}/> Déconnexion</button></div>
      </aside>

      {/* CONTENU */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Bonjour, {profile.company_name || 'Partenaire'} 👋</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Chiffre d'affaires" value={`${orders.reduce((acc, o) => acc + o.total_amount, 0).toFixed(2)}$`} icon={<ShoppingCart size={24}/>} color="bg-emerald-100 text-emerald-600" />
              <StatCard title="Produits actifs" value={products.length} icon={<Package size={24}/>} color="bg-blue-100 text-blue-600" />
            </div>
            {!profile.address_line1 && <div className="bg-amber-50 p-4 rounded border-l-4 border-amber-500 text-amber-800 mb-4">⚠️ Configurez votre adresse dans Paramètres.</div>}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8"><h1 className="text-2xl font-bold">Mon Inventaire</h1><button onClick={() => setShowAddForm(true)} className="bg-emerald-600 text-white px-4 py-2 rounded flex gap-2"><Plus size={20}/> Ajouter</button></div>
            {showAddForm && (
              <div className="bg-white p-6 rounded-xl shadow-sm mb-8"><form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4"><input type="text" placeholder="Nom" className="p-3 border rounded" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /><div className="flex gap-2"><input type="number" placeholder="Prix" className="p-3 border rounded w-full" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /><select className="p-3 border rounded" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}><option value="kg">kg</option><option value="unité">unité</option></select></div><input type="number" placeholder="Stock" className="p-3 border rounded" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} /><select className="p-3 border rounded" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option value="Alimentaire">Alimentaire</option><option value="Bureau">Bureau</option><option value="Équipement">Équipement</option></select><button type="submit" className="bg-slate-900 text-white p-3 rounded col-span-2">Sauvegarder</button></form></div>
            )}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full text-left"><thead><tr className="bg-slate-50"><th className="p-4">Produit</th><th className="p-4">Prix</th><th className="p-4">Action</th></tr></thead><tbody>{products.map(p => (<tr key={p.id} className="border-t"><td className="p-4 font-bold">{p.name}</td><td className="p-4">{p.price}$</td><td className="p-4"><button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Commandes</h1>
            <div className="space-y-4">
              {orders.length === 0 ? <p>Aucune commande.</p> : orders.map(o => (
                <div key={o.id} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <span className="font-bold">#{o.id.slice(0,8)}</span> 
                    <span className="ml-2 text-sm text-slate-500">{o.buyer?.company_name || 'Client inconnu'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => generateInvoice(o)} className="bg-slate-100 px-3 py-2 rounded text-sm font-bold flex gap-2"><FileText size={16}/> Facture</button>
                    {o.status === 'confirmed' && <button onClick={() => handlePrintLabel(o)} className="bg-slate-800 text-white px-3 py-2 rounded text-sm font-bold flex gap-2"><Printer size={16}/> Étiquette</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-xl font-bold mb-6">Paramètres</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <input type="text" placeholder="Nom Entreprise" className="w-full p-3 border rounded" value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} />
                <input type="text" placeholder="Adresse" className="w-full p-3 border rounded" value={profile.address_line1} onChange={e => setProfile({...profile, address_line1: e.target.value})} />
                <div className="flex gap-2"><input type="text" placeholder="Ville" className="w-full p-3 border rounded" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} /><input type="text" placeholder="Code Postal" className="w-full p-3 border rounded" value={profile.postal_code} onChange={e => setProfile({...profile, postal_code: e.target.value})} /></div>
                <button type="submit" disabled={savingProfile} className="w-full bg-emerald-600 text-white p-3 rounded font-bold">Sauvegarder</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, badge }) => <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${active ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}><div className="flex items-center gap-3">{icon}<span>{label}</span></div>{badge > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>}</button>;
const StatCard = ({ title, value, icon, color }) => <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4"><div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div><div><p className="text-slate-500 text-sm font-medium">{title}</p><p className="text-2xl font-bold text-slate-900">{value}</p></div></div>;

export default Dashboard;

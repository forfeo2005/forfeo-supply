import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { jsPDF } from "jspdf"; 

// ICÔNES SVG SIMPLES
const Icons = {
  Menu: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Package: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Cart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Chart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ company_name: '', address_line1: '', city: '', state: 'QC', postal_code: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
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
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profileData) setProfile({ company_name: profileData.company_name || '', address_line1: profileData.address_line1 || '', city: profileData.city || '', state: profileData.state || 'QC', postal_code: profileData.postal_code || '', phone: profileData.phone || '' });

    const { data: productsData } = await supabase.from('products').select('*').eq('supplier_id', userId).eq('active', true).order('created_at', { ascending: false });
    if (productsData) setProducts(productsData);

    const { data: ordersData } = await supabase.from('orders').select(`*, buyer: profiles (email, company_name, address_line1, city, state, postal_code), items: order_items (quantity, price_at_purchase, product: products (name, unit))`).eq('supplier_id', userId).order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);
    setLoading(false);
  };

  // --- FACTURE PDF (Québec) ---
  const generateInvoice = (order) => {
    const doc = new jsPDF();
    const TPS = 0.05, TVQ = 0.09975;
    doc.setFontSize(20); doc.text("FACTURE", 150, 20);
    doc.setFontSize(12); doc.text(`Fournisseur: ${profile.company_name || user.email}`, 20, 20);
    doc.text(`Adresse: ${profile.address_line1 || 'N/A'}, ${profile.city || ''}`, 20, 26);
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
    const tpsVal = subtotal * TPS;
    const tvqVal = subtotal * TVQ;
    const total = subtotal + tpsVal + tvqVal;
    y += 20; doc.line(100, y, 190, y); y += 10;
    doc.text("Sous-total:", 130, y); doc.text(subtotal.toFixed(2) + "$", 170, y);
    y += 8; doc.text("TPS (5%):", 130, y); doc.text(tpsVal.toFixed(2) + "$", 170, y);
    y += 8; doc.text("TVQ (9.975%):", 130, y); doc.text(tvqVal.toFixed(2) + "$", 170, y);
    y += 10; doc.setFont("helvetica", "bold"); doc.text("TOTAL:", 130, y); doc.text(total.toFixed(2) + " CAD", 170, y);
    doc.save(`Facture_${order.id.slice(0,8)}.pdf`);
  };

  // --- AJOUT PRODUIT (CORRIGÉ POUR ÉVITER ERREUR NULL) ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    const producerName = profile.company_name || user.email || "Fournisseur Forfeo"; 
    const { error } = await supabase.from('products').insert([{ supplier_id: user.id, name: newProduct.name, price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock), category: newProduct.category, unit: newProduct.unit, active: true, producer: producerName }]);
    if (error) alert('Erreur: ' + error.message); else { setShowAddForm(false); fetchData(user.id); }
  };

  // --- SUPPRESSION INTELLIGENTE (GÈRE ERREUR 409) ---
  const deleteProduct = async (id) => {
    if(!confirm("Supprimer ?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if(error && error.code === "23503") { // Erreur clé étrangère (produit commandé)
       alert("Ce produit est dans une commande. Il sera archivé au lieu d'être supprimé.");
       await supabase.from('products').update({ active: false }).eq('id', id);
       fetchData(user.id);
    } else if (error) { alert("Erreur: " + error.message); } 
    else { fetchData(user.id); }
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
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-30 flex justify-between items-center p-4 shadow-md"><span className="font-bold text-lg">⚡ Espace Pro</span><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}</button></div>
      <aside className={`fixed inset-y-0 left-0 z-20 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex md:flex-col shadow-xl`}>
        <div className="p-8 border-b border-slate-800 hidden md:block"><h2 className="font-bold text-xl text-white">Forfeo Supply</h2></div>
        <nav className="flex-1 p-4 space-y-2 mt-20 md:mt-4">
          <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Icons.Chart />} label="Vue d'ensemble" />
          <NavButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Icons.Package />} label="Ma Boutique" />
          <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Icons.Cart />} label="Commandes" badge={orders.filter(o => o.status === 'pending').length} />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Icons.Settings />} label="Paramètres" />
        </nav>
        <div className="p-6 border-t border-slate-800"><button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-900/30 text-red-400 rounded-xl transition text-sm">Déconnexion</button></div>
      </aside>
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Bonjour, {profile.company_name || user?.email} 👋</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Chiffre d'affaires" value={`${orders.reduce((acc, o) => acc + o.total_amount, 0).toFixed(2)}$`} icon={<Icons.Cart />} color="bg-blue-100 text-blue-600" />
              <StatCard title="Commandes à traiter" value={orders.filter(o => o.status === 'pending').length} icon={<Icons.Package />} color="bg-amber-100 text-amber-600" />
              <StatCard title="Produits en vente" value={products.length} icon={<Icons.Chart />} color="bg-emerald-100 text-emerald-600" />
            </div>
            {!profile.address_line1 && <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r flex justify-between items-center shadow-sm"><div><p className="font-bold text-amber-800">Profil incomplet ⚠️</p><p className="text-sm text-amber-700">Configurez votre adresse.</p></div><button onClick={() => setActiveTab('settings')} className="bg-white text-amber-700 font-bold px-4 py-2 rounded shadow hover:bg-amber-100">Configurer</button></div>}
          </div>
        )}
        {activeTab === 'products' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8"><h1 className="text-2xl font-bold">Mon Inventaire</h1><button onClick={() => setShowAddForm(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex gap-2"><Icons.Plus /> Ajouter</button></div>
            {showAddForm && (
              <div className="bg-white p-6 rounded-xl shadow-sm mb-8"><form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4"><input type="text" placeholder="Nom" required className="p-3 border rounded" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /><div className="flex gap-2"><input type="number" placeholder="Prix" required className="p-3 border rounded w-full" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /><select className="p-3 border rounded" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}><option value="kg">kg</option><option value="unité">unité</option></select></div><input type="number" placeholder="Stock" required className="p-3 border rounded" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} /><select className="p-3 border rounded" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option value="Alimentaire">Alimentaire</option><option value="Bureau">Bureau</option><option value="Équipement">Équipement</option><option value="Services">Services</option></select><button type="submit" className="md:col-span-2 bg-slate-900 text-white p-3 rounded font-bold">Sauvegarder</button></form></div>
            )}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="p-4">Produit</th><th className="p-4">Prix</th><th className="p-4">Action</th></tr></thead><tbody>{products.map(p => (<tr key={p.id} className="border-t"><td className="p-4 font-bold">{p.name}</td><td className="p-4">{p.price}$</td><td className="p-4"><button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700"><Icons.Trash /></button></td></tr>))}</tbody></table></div>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="max-w-6xl mx-auto"><h1 className="text-2xl font-bold mb-8">Commandes</h1><div className="space-y-4">{orders.map(o => (<div key={o.id} className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4"><div><span className="font-bold">#{o.id.slice(0,8)}</span> - {o.buyer?.company_name}</div><div className="flex gap-2"><button onClick={() => generateInvoice(o)} className="bg-slate-100 px-3 py-2 rounded text-sm font-bold">📄 Facture</button>{o.status === 'confirmed' && <button onClick={() => handlePrintLabel(o)} className="bg-slate-800 text-white px-3 py-2 rounded text-sm font-bold">🖨️ Étiquette</button>}{o.status === 'pending' && <button onClick={() => updateOrderStatus(o.id, 'confirmed')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Accepter</button>}</div></div>))}</div></div>
        )}
        {activeTab === 'settings' && <div className="max-w-2xl mx-auto"><h1 className="text-2xl font-bold mb-6">Paramètres</h1><div className="bg-white p-8 rounded-xl shadow-sm"><form onSubmit={handleSaveProfile} className="space-y-4"><input type="text" placeholder="Nom Entreprise" className="w-full p-3 border rounded" value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} /><input type="text" placeholder="Adresse" className="w-full p-3 border rounded" value={profile.address_line1} onChange={e => setProfile({...profile, address_line1: e.target.value})} /><div className="flex gap-2"><input type="text" placeholder="Ville" className="w-full p-3 border rounded" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} /><input type="text" placeholder="Code Postal" className="w-full p-3 border rounded" value={profile.postal_code} onChange={e => setProfile({...profile, postal_code: e.target.value})} /></div><button type="submit" disabled={savingProfile} className="w-full bg-emerald-600 text-white p-3 rounded font-bold">Sauvegarder</button></form></div></div>}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, badge }) => <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition font-medium ${active ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}><div className="flex items-center gap-3"><span>{icon}</span><span>{label}</span></div>{badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>}</button>;
const StatCard = ({ title, value, icon, color }) => <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-4"><div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>{icon}</div><div><p className="text-slate-500 text-sm font-medium">{title}</p><p className="text-2xl font-bold text-slate-900">{value}</p></div></div>;

export default Dashboard;

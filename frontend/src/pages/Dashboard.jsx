import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { jsPDF } from "jspdf"; 
import { Menu, X, Package, ShoppingCart, Settings, Trash2, Plus, LogOut, TrendingUp } from 'lucide-react';

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
    // Charge le profil pour avoir le nom du producteur
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (profileData) setProfile({ 
      company_name: profileData.company_name || '', 
      address_line1: profileData.address_line1 || '', 
      city: profileData.city || '', 
      state: profileData.state || 'QC', 
      postal_code: profileData.postal_code || '', 
      phone: profileData.phone || '' 
    });

    // Charge les produits
    const { data: productsData } = await supabase.from('products').select('*').eq('supplier_id', userId).eq('active', true).order('created_at', { ascending: false });
    if (productsData) setProducts(productsData);

    // Charge les commandes
    const { data: ordersData } = await supabase.from('orders').select(`*, buyer: profiles (email, company_name, address_line1, city, state, postal_code), items: order_items (quantity, price_at_purchase, product: products (name, unit))`).eq('supplier_id', userId).order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);
    setLoading(false);
  };

  // --- CORRECTION ERREUR PRODUCER NULL ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    // On force un nom de producteur si le profil est vide
    const producerName = profile.company_name || user.email || "Fournisseur";

    const { error } = await supabase.from('products').insert([{
        supplier_id: user.id,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        unit: newProduct.unit,
        active: true,
        producer: producerName // C'est ici que ça se joue !
    }]);

    if (error) alert('Erreur: ' + error.message);
    else {
      setShowAddForm(false);
      setNewProduct({ name: '', price: '', stock: '', category: 'Alimentaire', unit: 'kg' });
      fetchData(user.id);
    }
  };

  const deleteProduct = async (id) => {
    if(!confirm("Supprimer ?")) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    // Si on ne peut pas supprimer (car commandé), on archive
    if(error) {
       await supabase.from('products').update({ active: false }).eq('id', id);
       fetchData(user.id);
    } else {
       fetchData(user.id);
    }
  };

  const generateInvoice = (order) => {
    const doc = new jsPDF();
    const TPS = 0.05, TVQ = 0.09975;
    doc.setFontSize(20); doc.text("FACTURE", 150, 20);
    doc.setFontSize(12); doc.text(`Fournisseur: ${profile.company_name || user.email}`, 20, 20);
    doc.line(20, 35, 190, 35);
    let subtotal = 0;
    let y = 70;
    order.items.forEach(item => {
      subtotal += item.quantity * item.price_at_purchase;
      y += 10;
      doc.text(`${item.product?.name} x${item.quantity}`, 20, y);
      doc.text(`${(item.quantity * item.price_at_purchase).toFixed(2)}$`, 160, y);
    });
    const total = subtotal * (1 + TPS + TVQ);
    y += 20; doc.line(100, y, 190, y); y += 10;
    doc.text(`TOTAL (inc. taxes QC): ${total.toFixed(2)} CAD`, 120, y);
    doc.save(`Facture_${order.id.slice(0,8)}.pdf`);
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
          <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingCart size={20}/>} label="Commandes" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20}/>} label="Paramètres" />
        </nav>
        <div className="p-6 border-t border-slate-800"><button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-900/30 text-red-400 rounded-xl transition text-sm">Déconnexion</button></div>
      </aside>
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
        {activeTab === 'overview' && <div className="max-w-6xl mx-auto"><h1 className="text-3xl font-bold mb-8">Bonjour, {profile.company_name || 'Partenaire'} 👋</h1></div>}
        {activeTab === 'products' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8"><h1 className="text-2xl font-bold">Mon Inventaire</h1><button onClick={() => setShowAddForm(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex gap-2"><Plus size={20}/> Ajouter</button></div>
            {showAddForm && (
              <div className="bg-white p-6 rounded-xl shadow-sm mb-8"><form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-4"><input type="text" placeholder="Nom" required className="p-3 border rounded" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /><div className="flex gap-2"><input type="number" placeholder="Prix" required className="p-3 border rounded w-full" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /><select className="p-3 border rounded" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}><option value="kg">kg</option><option value="unité">unité</option></select></div><input type="number" placeholder="Stock" required className="p-3 border rounded" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} /><select className="p-3 border rounded" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option value="Alimentaire">Alimentaire</option><option value="Bureau">Bureau</option><option value="Équipement">Équipement</option><option value="Services">Services</option></select><button type="submit" className="md:col-span-2 bg-slate-900 text-white p-3 rounded font-bold">Sauvegarder</button></form></div>
            )}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase"><tr><th className="p-4">Produit</th><th className="p-4">Prix</th><th className="p-4">Action</th></tr></thead><tbody>{products.map(p => (<tr key={p.id} className="border-t"><td className="p-4 font-bold">{p.name}</td><td className="p-4">{p.price}$</td><td className="p-4"><button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button></td></tr>))}</tbody></table></div>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="max-w-6xl mx-auto"><h1 className="text-2xl font-bold mb-8">Commandes</h1><div className="space-y-4">{orders.map(o => (<div key={o.id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center"><div><span className="font-bold">#{o.id.slice(0,8)}</span></div><button onClick={() => generateInvoice(o)} className="bg-slate-100 px-3 py-2 rounded text-sm font-bold">📄 Facture</button></div>))}</div></div>
        )}
        {activeTab === 'settings' && <div className="max-w-2xl mx-auto"><div className="bg-white p-8 rounded-xl shadow-sm"><form onSubmit={handleSaveProfile} className="space-y-4"><input type="text" placeholder="Nom Entreprise" className="w-full p-3 border rounded" value={profile.company_name} onChange={e => setProfile({...profile, company_name: e.target.value})} /><button type="submit" disabled={savingProfile} className="w-full bg-emerald-600 text-white p-3 rounded font-bold">Sauvegarder</button></form></div></div>}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${active ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}>{icon}<span>{label}</span></button>;

export default Dashboard;

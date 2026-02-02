import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products'); // Vue par défaut : Ma Boutique
  const [user, setUser] = useState(null);
  
  // Données
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gestion du Formulaire Ajout Produit (Modal)
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Alimentaire',
    price: '',
    unit: 'unité',
    stock: 0
  });

  // Gestion du Changement de Mot de Passe
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [passwordMsg, setPasswordMsg] = useState('');

  // 1. Initialisation
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUser(user);
      fetchMyProducts(user.id);
    };
    initData();
  }, [navigate]);

  const fetchMyProducts = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Ajouter un produit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('products')
        .insert([
          {
            name: newProduct.name,
            category: newProduct.category,
            price: parseFloat(newProduct.price),
            unit: newProduct.unit,
            stock: parseInt(newProduct.stock),
            supplier_id: user.id,
            producer: user.email.split('@')[0], // Nom temporaire
            active: true
          }
        ]);

      if (error) throw error;

      setShowModal(false);
      setNewProduct({ name: '', category: 'Alimentaire', price: '', unit: 'unité', stock: 0 });
      fetchMyProducts(user.id);
      alert("Produit ajouté avec succès ! 🚀");

    } catch (error) {
      alert("Erreur lors de l'ajout : " + error.message);
    }
  };

  // 3. Changer le mot de passe
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');

    if (passwords.new !== passwords.confirm) {
      setPasswordMsg("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    if (passwords.new.length < 6) {
      setPasswordMsg("❌ Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: passwords.new 
      });

      if (error) throw error;

      setPasswordMsg("✅ Mot de passe mis à jour avec succès !");
      setPasswords({ new: '', confirm: '' });
      
    } catch (error) {
      setPasswordMsg(`❌ Erreur : ${error.message}`);
    }
  };

  // 4. Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
          <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon="🚚" label="Commandes" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="⚙️" label="Paramètres" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition text-sm font-medium">
            <span>🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        
        {/* --- VUE : MA BOUTIQUE --- */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Ma Boutique Locale</h1>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-forfeo-600 hover:bg-forfeo-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition flex items-center gap-2"
              >
                <span>+</span> Ajouter un produit
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="p-4">Produit</th>
                      <th className="p-4">Prix</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">État</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-400">Chargement...</td></tr>
                    ) : products.length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-400">Aucun produit.</td></tr>
                    ) : (
                      products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            <div className="font-medium text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.category}</div>
                          </td>
                          <td className="p-4 font-mono">{p.price} $ <span className="text-xs text-slate-400">/ {p.unit}</span></td>
                          <td className="p-4">
                            <span className={`font-bold ${p.stock < 10 ? 'text-red-500' : 'text-slate-700'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">En ligne</span>
                          </td>
                          <td className="p-4 text-right">
                            <button className="text-slate-400 hover:text-red-600 text-sm font-medium">Retirer</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- VUE : PARAMÈTRES (PROFIL & SÉCURITÉ) --- */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-2xl space-y-8">
             
             {/* Section Profil */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Profil Entreprise</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'entreprise</label>
                    <input type="text" className="w-full p-3 border border-slate-200 rounded-lg" defaultValue="Ma Super Entreprise" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea className="w-full p-3 border border-slate-200 rounded-lg h-24" defaultValue="Description visible par les clients..." />
                  </div>
                  <button className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition">Enregistrer le profil</button>
                </div>
             </div>

             {/* NOUVEAU : Section Sécurité (Mot de passe) */}
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  🔒 Sécurité
                </h2>
                
                {passwordMsg && (
                  <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${passwordMsg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {passwordMsg}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
                    <input 
                      type="password" 
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-forfeo-500 outline-none" 
                      placeholder="Minimum 6 caractères"
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de passe</label>
                    <input 
                      type="password" 
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-forfeo-500 outline-none" 
                      placeholder="Répétez le mot de passe"
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="bg-red-50 text-red-600 border border-red-100 px-6 py-2 rounded-lg font-bold hover:bg-red-100 transition"
                  >
                    Mettre à jour le mot de passe
                  </button>
                </form>
             </div>

          </div>
        )}

        {/* --- PLACEHOLDERS --- */}
        {activeTab === 'overview' && <div className="p-10 text-center text-slate-400">Tableau de bord en construction... 🚧</div>}
        {activeTab === 'orders' && <div className="p-10 text-center text-slate-400">Module de commandes à venir... 📦</div>}

      </main>

      {/* --- MODAL AJOUT PRODUIT --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Ajouter un produit</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                <input 
                  type="text" required placeholder="Ex: Café équitable" 
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none"
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                  <select 
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option>Alimentaire</option>
                    <option>Bureau</option>
                    <option>Services</option>
                    <option>Équipement</option>
                    <option>Hôtellerie</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input 
                    type="number" required min="0"
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix ($)</label>
                  <input 
                    type="number" required min="0" step="0.01"
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unité</label>
                  <select 
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none"
                    value={newProduct.unit}
                    onChange={e => setNewProduct({...newProduct, unit: e.target.value})}
                  >
                    <option value="unité">Par unité</option>
                    <option value="kg">Par kg</option>
                    <option value="lb">Par livre</option>
                    <option value="caisse">Par caisse</option>
                    <option value="heure">Par heure</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-forfeo-600 hover:bg-forfeo-700 text-white font-bold py-3 rounded-xl shadow-lg transition mt-4">
                Publier
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
      active ? 'bg-forfeo-600 text-white shadow-lg shadow-forfeo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

export default Dashboard;

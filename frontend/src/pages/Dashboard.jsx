import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // Gestion des onglets
  const [loading, setLoading] = useState(false);
  
  // États pour les données (Simulation pour l'instant)
  const [products, setProducts] = useState([
    { id: 1, name: 'Carottes des Sables', price: 2.50, stock: 150, status: 'active' },
    { id: 2, name: 'Sirop d\'Érable Doré', price: 12.00, stock: 45, status: 'active' },
  ]);

  const [orders, setOrders] = useState([
    { id: 101, client: 'Resto Le Saint-Amour', total: 245.50, status: 'En attente', date: '2026-02-01' },
    { id: 102, client: 'Bureau Ubisoft', total: 89.00, status: 'Livré', date: '2026-01-29' },
  ]);

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
      
      {/* --- SIDEBAR (Menu Latéral) --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full z-20">
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

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 ml-64 p-8">
        
        {/* Header Mobile/Tablet Check would go here */}
        
        {/* VUE : VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Bonjour, Partenaire 👋</h1>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Ventes du mois" value="12,450 $" trend="+12%" color="bg-emerald-100 text-emerald-700" />
              <StatCard title="Commandes à traiter" value="3" trend="Urgent" color="bg-orange-100 text-orange-700" />
              <StatCard title="Produits actifs" value="24" trend="Stock OK" color="bg-blue-100 text-blue-700" />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="font-bold mb-4">Dernières activités</h2>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition">
                    <div>
                      <p className="font-medium text-slate-800">Commande #{order.id}</p>
                      <p className="text-sm text-slate-500">{order.client}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Livré' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VUE : MA BOUTIQUE (Gestion Catalogue) */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Ma Boutique Locale</h1>
              <button className="bg-forfeo-600 hover:bg-forfeo-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition">
                + Nouveau Produit
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="p-4">Nom du produit</th>
                    <th className="p-4">Prix</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">État</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-medium">{p.name}</td>
                      <td className="p-4">{p.price.toFixed(2)} $</td>
                      <td className="p-4">{p.stock} unités</td>
                      <td className="p-4">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Actif</span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button className="text-slate-400 hover:text-blue-600 text-sm font-medium">Modifier</button>
                        <button className="text-slate-400 hover:text-red-600 text-sm font-medium">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VUE : COMMANDES */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Gestion des Commandes</h1>
            <div className="grid gap-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg">Commande #{order.id}</h3>
                      <span className="text-xs text-slate-400">{order.date}</span>
                    </div>
                    <p className="text-slate-600">Client : <span className="font-medium text-slate-900">{order.client}</span></p>
                    <p className="text-emerald-600 font-bold mt-1">Total : {order.total} $</p>
                  </div>
                  
                  <div className="flex gap-3">
                    {order.status === 'En attente' && (
                      <>
                        <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition">Refuser</button>
                        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-emerald-700 transition">Accepter</button>
                      </>
                    )}
                    {order.status === 'Livré' && (
                      <span className="text-slate-400 font-medium italic">Terminé</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VUE : PARAMÈTRES (PROFIL) */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in max-w-2xl">
             <h1 className="text-2xl font-bold text-slate-900 mb-6">Profil Entreprise</h1>
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'entreprise</label>
                  <input type="text" className="w-full p-3 border border-slate-200 rounded-lg" defaultValue="Ferme du Bonheur" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description (visible sur le Marché)</label>
                  <textarea className="w-full p-3 border border-slate-200 rounded-lg h-32" defaultValue="Producteur local depuis 1998..." />
                </div>
                <button className="bg-slate-900 text-white px-6 py-3 rounded-lg font-bold">Enregistrer les modifications</button>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

// Composant Bouton Navigation
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

// Composant Carte Statistique
const StatCard = ({ title, value, trend, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-2">{title}</p>
    <div className="flex items-end justify-between">
      <span className="text-3xl font-bold text-slate-800">{value}</span>
      <span className={`text-xs font-bold px-2 py-1 rounded ${color}`}>{trend}</span>
    </div>
  </div>
);

export default Dashboard;

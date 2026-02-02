import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Données simulées (En attendant qu'on code le Panier réel)
  const [orders, setOrders] = useState([
    { id: 'CMD-8859', supplier: 'Ferme du Bonheur', date: '01 Fév', total: 124.50, status: 'En livraison', items: 'Carottes, Pommes de terre' },
    { id: 'CMD-8812', supplier: 'Papeterie Québec', date: '28 Jan', total: 45.00, status: 'Livré', items: 'Papier A4, Stylos' },
  ]);

  useEffect(() => {
    const getUser = async () => {
      // La session est gérée automatiquement par Supabase ici
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/login');
      setUser(user);
    };
    getUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Header Privé Acheteur */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {/* Le logo redirige vers le marché pour une navigation fluide */}
          <Link to="/market" className="text-2xl hover:scale-110 transition">🌱</Link>
          <span className="font-bold text-slate-800 hidden sm:inline">Espace Acheteur</span>
        </div>
        <div className="flex items-center gap-4">
          
          {/* MODIFICATION ICI : Bouton Retour à l'accueil */}
          <Link to="/" className="text-slate-600 hover:text-emerald-600 font-medium text-sm">
            ← Retour à l'accueil
          </Link>
          
          <div className="h-6 w-px bg-slate-200"></div>
          <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 md:p-10">
        
        {/* Section de Bienvenue */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vos Commandes</h1>
            <p className="text-slate-500 mt-2">Suivez vos livraisons et gérez vos factures.</p>
          </div>
          <Link to="/market" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition transform hover:-translate-y-0.5 flex items-center gap-2">
            <span>🛒</span> Nouvelle Commande
          </Link>
        </div>

        {/* Grille Principale */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE : Historique Commandes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Carte "Suivi en cours" */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl pointer-events-none">🚚</div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                En cours
              </h2>
              
              {orders.filter(o => o.status !== 'Livré').map(order => (
                <div key={order.id} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0 mb-4 last:mb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-800">{order.supplier}</p>
                      <p className="text-xs text-slate-500">Commande #{order.id} • {order.date}</p>
                    </div>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{order.items}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold">{order.total} $</span>
                    <button className="text-sm text-emerald-600 font-medium hover:underline">Voir détails</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Historique Passé */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Historique récent</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Fournisseur</th>
                    <th className="pb-3 font-medium text-right">Montant</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.filter(o => o.status === 'Livré').map(order => (
                    <tr key={order.id} className="group hover:bg-slate-50 transition">
                      <td className="py-3 text-slate-500">{order.date}</td>
                      <td className="py-3 font-medium text-slate-800">{order.supplier}</td>
                      <td className="py-3 text-right font-mono">{order.total} $</td>
                      <td className="py-3 text-right">
                        <button className="text-slate-400 group-hover:text-emerald-600 font-medium transition">Recommander</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* COLONNE DROITE : Outils Rapides */}
          <div className="space-y-6">
            
            {/* Carte Profil Rapide */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl">🏢</div>
                <div>
                  <p className="font-bold text-lg">Resto Le Gourmet</p>
                  <p className="text-slate-400 text-sm">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                  <span className="text-slate-400">Dépenses ce mois</span>
                  <span className="font-bold text-emerald-400">1,245 $</span>
                </div>
                <div className="flex justify-between text-sm border-b border-white/10 pb-2">
                  <span className="text-slate-400">Fournisseurs actifs</span>
                  <span className="font-bold">4</span>
                </div>
              </div>
              <button className="w-full mt-6 bg-white text-slate-900 font-bold py-2 rounded-lg hover:bg-slate-200 transition text-sm">
                Gérer mon profil
              </button>
            </div>

            {/* Suggestions IA */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                <span>🤖</span> Suggestion IA
              </h3>
              <p className="text-sm text-emerald-700 mb-4 leading-relaxed">
                D'après vos habitudes, vous allez manquer de <strong>Café en grain</strong> d'ici mardi.
              </p>
              <Link to="/market?search=café" className="block text-center w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 rounded-lg transition shadow-sm">
                Voir les offres de Café
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;

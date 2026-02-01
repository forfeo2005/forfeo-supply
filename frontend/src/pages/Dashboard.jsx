import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // On charge les produits pour simuler l'inventaire du fournisseur
  useEffect(() => {
    // Vérification de sécurité : si pas connecté, retour au login
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate('/login');
    };
    checkUser();

    // Récupération des données (Simulation)
    const API_URL = 'https://forfeo-supply-api.onrender.com';
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Top Bar spécifique Dashboard */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">⚡</span> Espace Fournisseur
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 hidden sm:inline">Ferme du Bonheur (Démo)</span>
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        
        {/* --- SECTION STATS (KPIs) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Carte 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Chiffre d'affaires (J-30)</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">12,450 $</p>
            <span className="inline-block mt-2 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">+12% vs mois dernier</span>
          </div>
          
          {/* Carte 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Commandes à préparer</p>
            <p className="text-3xl font-bold text-forfeo-600 mt-2">8</p>
            <p className="text-xs text-slate-400 mt-2">Dont 3 pour demain matin</p>
          </div>

          {/* Carte 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Note Clients</p>
            <p className="text-3xl font-bold text-yellow-500 mt-2">4.9/5</p>
            <p className="text-xs text-slate-400 mt-2">Basé sur 42 avis</p>
          </div>
        </div>

        {/* --- SECTION INVENTAIRE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">📦 Mon Inventaire</h2>
            <button className="bg-forfeo-600 hover:bg-forfeo-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition shadow-md">
              + Nouveau Produit
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Produit</th>
                  <th className="p-4 font-semibold">Catégorie</th>
                  <th className="p-4 font-semibold">Prix</th>
                  <th className="p-4 font-semibold text-center">Stock</th>
                  <th className="p-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-6 text-center text-slate-500">Chargement...</td></tr>
                ) : products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-medium text-slate-800">{p.name}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono">{p.price} $</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        En stock
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-forfeo-600 font-medium text-sm">Modifier</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

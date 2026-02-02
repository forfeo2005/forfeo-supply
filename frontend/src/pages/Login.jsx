import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

const Login = () => {
  const navigate = useNavigate();
  
  // --- ÉTATS ---
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Bascule Connexion / Inscription
  const [selectedRole, setSelectedRole] = useState(null); // 'merchant' ou 'supplier' ou null

  // Données formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  // --- LOGIQUE D'AUTHENTIFICATION ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // Sécurité mdp
    if (password.length < 6) {
      setMsg("⚠️ Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // --- INSCRIPTION ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: selectedRole } // On stocke le rôle choisi
          }
        });

        if (error) throw error;

        if (data.user) {
          // Création profil
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: data.user.id,
              role: selectedRole,
              email: email,
              status: 'pending' // Par défaut, en attente d'approbation
            });
            
          if (profileError) console.error("Erreur profil:", profileError);
          
          setMsg('✅ Compte créé ! Redirection...');
          
          setTimeout(() => {
            if (selectedRole === 'supplier') navigate('/dashboard');
            else navigate('/merchant');
          }, 1500);
        }

      } else {
        // --- CONNEXION ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Vérification du rôle en base de données
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // --- LOGIQUE DE REDIRECTION (AVEC ADMIN) ---
        if (profile?.role === 'admin') {
           navigate('/admin'); // <--- Redirection vers le Portail Admin
        } else if (profile?.role === 'supplier') {
          navigate('/dashboard');
        } else {
          navigate('/merchant');
        }
      }
    } catch (error) {
      console.error(error);
      setMsg(`❌ Erreur : ${error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDU : ÉTAPE 1 - SÉLECTION DU RÔLE ---
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-forfeo-600 transition font-medium">
          <span>←</span> Retour à l'accueil
        </Link>

        <div className="text-center mb-10">
          <span className="text-4xl mb-4 block">👋</span>
          <h1 className="text-3xl font-bold text-slate-900">Bienvenue sur Forfeo</h1>
          <p className="text-slate-500 mt-2">Choisissez votre espace pour continuer</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl w-full">
          {/* Carte Commerçant */}
          <button 
            onClick={() => setSelectedRole('merchant')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all group text-left"
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
              🏪
            </div>
            <h2 className="text-xl font-bold text-slate-900">Je suis Acheteur</h2>
            <p className="text-sm text-slate-500 mt-2">Restaurants, Bureaux, Hôtels... Accédez au catalogue et commandez en gros.</p>
            <span className="inline-block mt-4 text-emerald-600 font-bold text-sm group-hover:underline">Se connecter →</span>
          </button>

          {/* Carte Fournisseur */}
          <button 
            onClick={() => setSelectedRole('supplier')}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all group text-left"
          >
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition">
              🏭
            </div>
            <h2 className="text-xl font-bold text-slate-900">Je suis Fournisseur</h2>
            <p className="text-sm text-slate-500 mt-2">Producteurs, Grossistes, Services... Gérez vos produits et vos commandes.</p>
            <span className="inline-block mt-4 text-blue-600 font-bold text-sm group-hover:underline">Se connecter →</span>
          </button>
        </div>
      </div>
    );
  }

  // --- RENDU : ÉTAPE 2 - FORMULAIRE DE LOGIN ---
  const isSupplier = selectedRole === 'supplier';
  const themeColor = isSupplier ? 'bg-blue-600' : 'bg-emerald-600'; // Bleu pour fournisseur, Vert pour acheteur

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      
      {/* Bouton retour au choix */}
      <button 
        onClick={() => { setSelectedRole(null); setMsg(''); }}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium"
      >
        <span>←</span> Changer de profil
      </button>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mt-10">
        
        {/* Header Dynamique */}
        <div className={`${themeColor} p-8 text-center transition-colors duration-300`}>
          <div className="text-4xl mb-2">{isSupplier ? '🏭' : '🏪'}</div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Espace {isSupplier ? 'Fournisseur' : 'Acheteur'}
          </h2>
          <p className="text-white/80 text-sm">
            {isSignUp ? 'Créez votre compte professionnel' : 'Connectez-vous à votre tableau de bord'}
          </p>
        </div>

        <div className="p-8">
          {msg && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email professionnel</label>
              <input 
                type="email" required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-400 outline-none transition"
                placeholder="nom@entreprise.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input 
                type="password" required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-400 outline-none transition"
                placeholder="Minimum 6 caractères"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full ${themeColor} hover:opacity-90 text-white font-bold py-3 rounded-lg shadow-lg transition disabled:opacity-50`}
            >
              {loading ? 'Chargement...' : (isSignUp ? "Créer mon compte" : "Se connecter")}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-600 text-sm">
              {isSignUp ? "Déjà un compte ?" : "Pas encore de compte ?"}
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setMsg(''); }} 
                className={`ml-2 font-bold hover:underline ${isSupplier ? 'text-blue-600' : 'text-emerald-600'}`}
              >
                {isSignUp ? "Se connecter" : "S'inscrire gratuitement"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

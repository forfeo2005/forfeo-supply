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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative font-sans">
        {/* Bouton retour */}
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition font-medium z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
          <span>←</span> Retour à l'accueil
        </Link>

        {/* Décoration de fond */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 via-slate-50 to-slate-50 opacity-70"></div>
           <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
           <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-4xl w-full flex flex-col items-center">
          <div className="text-center mb-12">
            <span className="text-5xl mb-4 block animate-bounce">👋</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Bienvenue sur Forfeo</h1>
            <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
              La plateforme B2B qui connecte l'économie locale. <br/>Choisissez votre espace pour continuer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 w-full px-2">
            {/* Carte Acheteur */}
            <button 
              onClick={() => setSelectedRole('merchant')}
              className="group bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  🏪
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Je suis Acheteur</h2>
                <p className="text-slate-500 mb-6 leading-relaxed">
                  Pour les restaurants, bureaux et hôtels. Accédez au catalogue, comparez les prix et commandez en gros.
                </p>
                <div className="flex items-center text-emerald-600 font-bold text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                  Accéder à l'espace <span className="ml-1">→</span>
                </div>
              </div>
            </button>

            {/* Carte Fournisseur */}
            <button 
              onClick={() => setSelectedRole('supplier')}
              className="group bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  🏭
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Je suis Fournisseur</h2>
                <p className="text-slate-500 mb-6 leading-relaxed">
                  Pour les producteurs et grossistes. Gérez vos produits, vos stocks et recevez des commandes directes.
                </p>
                <div className="flex items-center text-blue-600 font-bold text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                  Accéder à l'espace <span className="ml-1">→</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDU : ÉTAPE 2 - FORMULAIRE DE LOGIN ---
  const isSupplier = selectedRole === 'supplier';
  const themeColor = isSupplier ? 'bg-blue-600' : 'bg-emerald-600'; 
  const themeLight = isSupplier ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative font-sans">
      
      {/* Bouton retour */}
      <button 
        onClick={() => { setSelectedRole(null); setMsg(''); }}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium z-10 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
      >
        <span>←</span> Changer de profil
      </button>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-fade-in-up">
        
        {/* Header Dynamique */}
        <div className={`${themeColor} p-10 text-center transition-colors duration-500 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="text-5xl mb-4 transform hover:scale-110 transition-transform duration-300 inline-block drop-shadow-md">
                {isSupplier ? '🏭' : '🏪'}
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
              Espace {isSupplier ? 'Fournisseur' : 'Acheteur'}
            </h2>
            <p className="text-white/90 text-sm font-medium">
              {isSignUp ? 'Créez votre compte professionnel' : 'Connectez-vous pour continuer'}
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          {msg && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-3 ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              <span>{msg.includes('✅') ? '🎉' : '⚠️'}</span>
              {msg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email professionnel</label>
              <input 
                type="email" required
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-slate-300 focus:ring-0 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="nom@entreprise.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Mot de passe</label>
              <input 
                type="password" required
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-slate-300 focus:ring-0 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full ${themeColor} hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none`}
            >
              {loading ? (
                  <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Connexion...
                  </span>
              ) : (isSignUp ? "Créer mon compte →" : "Se connecter →")}
            </button>
          </form>

          <div className="mt-8 text-center pt-8 border-t border-slate-100">
            <p className="text-slate-500 text-sm">
              {isSignUp ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setMsg(''); }} 
                className={`ml-2 font-bold hover:underline transition-colors ${isSupplier ? 'text-blue-600' : 'text-emerald-600'}`}
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

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('merchant');
  const [msg, setMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // Supabase impose 6 caractères minimum par sécurité.
    // On prévient l'utilisateur pour éviter l'erreur 400 obscure.
    if (password.length < 6) {
      setMsg("⚠️ Le mot de passe doit contenir au moins 6 caractères (Sécurité Supabase).");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // --- INSCRIPTION ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          // Cette option assure que si l'email confirm est OFF, on connecte direct
          options: {
            data: { role: role } // On stocke le rôle direct dans les métadonnées
          }
        });

        if (error) throw error;

        if (data.user) {
          // Création du profil dans la table 'profiles'
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: data.user.id,
              role: role,
              email: email
            });
            
          if (profileError) console.error("Erreur profil:", profileError);
          
          setMsg('✅ Compte créé avec succès ! Redirection...');
          
          // Redirection immédiate après inscription
          setTimeout(() => {
            if (role === 'supplier') navigate('/dashboard');
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

        // Vérification du rôle pour rediriger
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'supplier') {
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      
      {/* BOUTON RETOUR ACCUEIL */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-forfeo-600 transition font-medium">
        <span>←</span> Retour à l'accueil
      </Link>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mt-10">
        <div className="bg-forfeo-600 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? 'Rejoindre Forfeo' : 'Bienvenue'}
          </h2>
          <p className="text-forfeo-100">
            {isSignUp ? 'Créez votre réseau B2B local' : 'Connectez-vous à votre espace'}
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
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-forfeo-500 outline-none"
                placeholder="nom@entreprise.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input 
                type="password" required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-forfeo-500 outline-none"
                placeholder="Minimum 6 caractères"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isSignUp && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-3">Vous êtes :</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="role" value="merchant" checked={role === 'merchant'} onChange={(e) => setRole(e.target.value)} className="text-forfeo-600 focus:ring-forfeo-500" />
                    <span className="text-slate-800">Acheteur</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="role" value="supplier" checked={role === 'supplier'} onChange={(e) => setRole(e.target.value)} className="text-forfeo-600 focus:ring-forfeo-500" />
                    <span className="text-slate-800">Fournisseur</span>
                  </label>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-forfeo-600 hover:bg-forfeo-700 text-white font-bold py-3 rounded-lg shadow-lg transition disabled:opacity-50">
              {loading ? 'Chargement...' : (isSignUp ? "Créer mon compte" : "Se connecter")}
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-600 text-sm">
              {isSignUp ? "Déjà un compte ?" : "Pas encore de compte ?"}
              <button onClick={() => { setIsSignUp(!isSignUp); setMsg(''); }} className="ml-2 text-forfeo-700 font-bold hover:underline">
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

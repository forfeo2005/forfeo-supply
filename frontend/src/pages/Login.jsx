import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Basculer entre Connexion et Inscription
  
  // Données du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('merchant'); // Par défaut : Acheteur (Commerçant)
  const [msg, setMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      if (isSignUp) {
        // --- INSCRIPTION ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Si l'inscription marche, on met à jour le rôle choisi (Acheteur ou Fournisseur)
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: role })
            .eq('id', data.user.id);
            
          if (profileError) console.error("Erreur mise à jour profil:", profileError);
          
          setMsg('✅ Compte créé ! Vérifiez vos emails ou connectez-vous.');
          setIsSignUp(false); // On repasse en mode connexion
        }

      } else {
        // --- CONNEXION ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // On vérifie qui se connecte pour le rediriger au bon endroit
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        // LOGIQUE DE REDIRECTION INTELLIGENTE
        if (profile?.role === 'supplier') {
          navigate('/dashboard'); // Vers le tableau de bord Vendeur
        } else {
          // MODIFICATION ICI : On redirige les acheteurs vers leur nouveau dashboard
          navigate('/merchant'); 
        }
      }
    } catch (error) {
      setMsg(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* En-tête vert */}
        <div className="bg-forfeo-600 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? 'Rejoindre Forfeo' : 'Bienvenue'}
          </h2>
          <p className="text-forfeo-100">
            {isSignUp ? 'Créez votre réseau B2B local' : 'Connectez-vous à votre espace'}
          </p>
        </div>

        {/* Formulaire */}
        <div className="p-8">
          {msg && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            
            {/* Champs Email & Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email professionnel</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-forfeo-500 focus:border-transparent outline-none transition"
                placeholder="chef@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-forfeo-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Sélecteur de Rôle (Uniquement si Inscription) */}
            {isSignUp && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-3">Vous êtes :</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="role" 
                      value="merchant" 
                      checked={role === 'merchant'} 
                      onChange={(e) => setRole(e.target.value)}
                      className="text-forfeo-600 focus:ring-forfeo-500"
                    />
                    <span className="text-slate-800">Acheteur</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="role" 
                      value="supplier" 
                      checked={role === 'supplier'} 
                      onChange={(e) => setRole(e.target.value)}
                      className="text-forfeo-600 focus:ring-forfeo-500"
                    />
                    <span className="text-slate-800">Fournisseur</span>
                  </label>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-forfeo-600 hover:bg-forfeo-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : (isSignUp ? "Créer mon compte" : "Se connecter")}
            </button>
          </form>

          {/* Toggle Inscription / Connexion */}
          <div className="mt-6 text-center pt-6 border-t border-slate-100">
            <p className="text-slate-600 text-sm">
              {isSignUp ? "Déjà un compte ?" : "Pas encore de compte ?"}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-forfeo-700 font-bold hover:underline focus:outline-none"
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

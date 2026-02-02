import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  
  // Données
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Inputs pour nouveau message
  const [newMessage, setNewMessage] = useState({ content: '', target: 'all', type: 'info' });

  // Changement mot de passe
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState('');

  // --- CHARGEMENT ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Récupérer les utilisateurs
    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 2. Récupérer les messages
    const { data: msgsData } = await supabase
      .from('system_messages')
      .select('*')
      .order('created_at', { ascending: false });

    setUsers(usersData || []);
    setMessages(msgsData || []);
    setLoading(false);
  };

  // --- GESTION UTILISATEURS ---
  const updateUserStatus = async (id, status) => {
    if(!window.confirm(`Êtes-vous sûr de passer cet utilisateur en : ${status} ?`)) return;
    
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (!error) fetchData();
  };

  const deleteUser = async (id) => {
    if(!window.confirm("⚠️ ATTENTION : Suppression définitive. Continuer ?")) return;
    
    // Note: Pour supprimer complètement, il faudrait utiliser une fonction admin Supabase,
    // mais ici on peut supprimer le profil ou le bannir.
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) fetchData();
  };

  // --- GESTION MESSAGES ---
  const postMessage = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('system_messages').insert([{
      content: newMessage.content,
      target_page: newMessage.target,
      type: newMessage.type,
      active: true
    }]);

    if (!error) {
      setNewMessage({ content: '', target: 'all', type: 'info' });
      fetchData();
      alert("Message publié !");
    }
  };

  const deleteMessage = async (id) => {
    await supabase.from('system_messages').delete().eq('id', id);
    fetchData();
  };

  // --- SECURITE (Changer mot de passe) ---
  const updatePassword = async (e) => {
    e.preventDefault();
    if(passwords.new !== passwords.confirm) return setPwdMsg("Les mots de passe ne correspondent pas");
    
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) setPwdMsg("Erreur: " + error.message);
    else setPwdMsg("✅ Mot de passe changé !");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex text-slate-900">
      
      {/* SIDEBAR NOIRE */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <span className="font-bold tracking-wide">ADMIN PORTAL</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <MenuButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="👥" label="Utilisateurs" />
          <MenuButton active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon="📢" label="Communications" />
          <MenuButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="🔒" label="Sécurité Admin" />
        </nav>
        <button onClick={handleLogout} className="m-4 flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition font-bold text-sm">
          <span>🚪</span> Déconnexion
        </button>
      </aside>

      {/* CONTENU */}
      <main className="flex-1 ml-64 p-8">
        
        {/* VUE : UTILISATEURS */}
        {activeTab === 'users' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Gestion des Inscriptions</h1>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="p-4">Email / ID</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono text-sm">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'supplier' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          u.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                          u.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {u.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {u.role !== 'admin' && (
                          <>
                            <button onClick={() => updateUserStatus(u.id, 'approved')} className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded hover:bg-emerald-100 font-bold">Approuver</button>
                            <button onClick={() => updateUserStatus(u.id, 'banned')} className="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded hover:bg-orange-100 font-bold">Suspendre</button>
                            <button onClick={() => deleteUser(u.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 font-bold">Supprimer</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VUE : MESSAGES */}
        {activeTab === 'messages' && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Communications Système</h1>
            
            {/* Formulaire nouveau message */}
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <h2 className="font-bold mb-4">📢 Diffuser un nouveau message</h2>
              <form onSubmit={postMessage} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                  <input required type="text" className="w-full border p-2 rounded-lg" value={newMessage.content} onChange={e => setNewMessage({...newMessage, content: e.target.value})} placeholder="Ex: Maintenance prévue ce soir..." />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Page Cible</label>
                  <select className="w-full border p-2 rounded-lg" value={newMessage.target} onChange={e => setNewMessage({...newMessage, target: e.target.value})}>
                    <option value="all">Partout</option>
                    <option value="home">Page d'accueil</option>
                    <option value="merchant">Portail Acheteur</option>
                    <option value="supplier">Portail Fournisseur</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select className="w-full border p-2 rounded-lg" value={newMessage.type} onChange={e => setNewMessage({...newMessage, type: e.target.value})}>
                    <option value="info">Info (Bleu)</option>
                    <option value="warning">Alerte (Jaune)</option>
                    <option value="success">Succès (Vert)</option>
                  </select>
                </div>
                <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Publier</button>
              </form>
            </div>

            {/* Liste des messages actifs */}
            <div className="grid gap-4">
              {messages.map(m => (
                <div key={m.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border-l-4 border-slate-900">
                  <div>
                    <div className="flex gap-2 mb-1">
                      <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">{m.target_page.toUpperCase()}</span>
                      <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">{m.type}</span>
                    </div>
                    <p className="font-medium text-lg">{m.content}</p>
                    <p className="text-xs text-slate-400">{new Date(m.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteMessage(m.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">Supprimer</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VUE : REGLAGES ADMIN */}
        {activeTab === 'settings' && (
          <div className="max-w-md">
            <h1 className="text-3xl font-bold mb-6">Sécurité Admin</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="font-bold mb-4">Changer mon mot de passe</h2>
              {pwdMsg && <p className="mb-4 text-sm font-bold text-blue-600">{pwdMsg}</p>}
              <form onSubmit={updatePassword} className="space-y-4">
                <input type="password" required placeholder="Nouveau mot de passe" className="w-full border p-3 rounded-lg" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                <input type="password" required placeholder="Confirmer" className="w-full border p-3 rounded-lg" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg">Mettre à jour</button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const MenuButton = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${active ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <span>{icon}</span><span>{label}</span>
  </button>
);

export default AdminDashboard;

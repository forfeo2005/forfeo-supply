import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';
import { Menu, X, Search, ShoppingBag, User, LogOut, Star, TrendingUp, Filter } from 'lucide-react';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('catalog');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Données
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres & Recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tout');
  const [sortBy, setSortBy] = useState('priceAsc'); 

  // Profil
  const [profile, setProfile] = useState({
    company_name: '',
    address_line1: '',
    city: '',
    state: 'QC',
    postal_code: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  const { addToCart, cartCount } = useCart();

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      setUser(user);
      fetchData(user.id);
    };
    initData();
  }, [navigate]);

  const fetchData = async (userId) => {
    setLoading(true);
    // 1. Catalogue (Seulement les produits valides avec du stock)
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .gt('stock', 0)
      .not('supplier_id', 'is', null) // SÉCURITÉ : Ignore les produits sans fournisseur
      .order('created_at', { ascending: false });
      
    if (productsData) setProducts(productsData);

    // 2. Commandes acheteur
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`*, items: order_items (quantity, price_at_purchase, product: products (name))`)
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });
    if (ordersData) setOrders(ordersData);

    // 3. Profil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileData) {
      setProfile({
        company_name: profileData.company_name || '',
        address_line1: profileData.address_line1 || '',
        city: profileData.city || '',
        state: profileData.state || 'QC',
        postal_code: profileData.postal_code || '',
        phone: profileData.phone || '',
      });
    }

    setLoading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id);

    if (error) {
      alert("Erreur: " + error.message);
    } else {
      alert("Profil mis à jour ! ✅");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Logique de tri pour le comparateur
  const getMinPrice = (cat) => {
    const prods = products.filter(p => p.category === cat);
    return prods.length ? Math.min(...prods.map(p => p.price)) : 0;
  };

  const filteredProducts = products
    .filter(p => selectedCategory === 'Tout' || p.category === selectedCategory)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const categories = ['Tout', 'Alimentaire', 'Bureau', 'Équipement', 'Services', 'Autre'];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row text-slate-900">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-emerald-900 text-white z-30 flex justify-between items-center p-4 shadow-md">
        <span className="font-bold text-lg flex items-center gap-2">🌱 Forfeo Market</span>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/cart')} className="relative" aria-label="Voir le panier">
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Basculer le menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-72 bg-emerald-900 text-emerald-50 transform transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:static md:flex md:flex-col shadow-2xl`}
      >
        <div className="p-8 border-b border-emerald-800 hidden md:flex items-center gap-3">
          <span className="text-3xl">🌱</span>
          <div>
            <h2 className="font-bold text-xl text-white">Forfeo</h2>
            <p className="text-xs text-emerald-300 font-bold uppercase">
              Espace Acheteur
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-20 md:mt-4">
          <NavButton
            active={activeTab === 'catalog'}
            onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
            icon={<ShoppingBag size={20} />}
            label="Marché Local"
          />
          <NavButton
            active={activeTab === 'orders'}
            onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
            icon={<TrendingUp size={20} />}
            label="Mes Commandes"
          />
          <NavButton
            active={activeTab === 'settings'}
            onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
            icon={<User size={20} />}
            label="Mon Profil"
          />
        </nav>

        <div className="p-6 border-t border-emerald-800">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white p-3 rounded-xl font-bold flex items-center justify-between shadow-lg mb-4 transition"
          >
            <span className="flex items-center gap-2 text-emerald-900">
              <ShoppingBag size={20} /> Panier
            </span>
            {cartCount > 0 && (
              <span className="bg-white text-emerald-900 text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-500/20 text-emerald-200 rounded-xl transition text-sm"
          >
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen bg-slate-50">
        
        {/* TAB : CATALOGUE / COMPARATEUR */}
        {activeTab === 'catalog' && (
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Le Marché Local
              </h1>
              <p className="text-slate-500">
                Comparez les prix en temps réel.
              </p>
            </header>

            {/* FILTRES & RECHERCHE */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row gap-4 sticky top-0 z-10 border border-slate-100">
              <div className="relative flex-1">
                <div className="absolute left-3 top-3 text-slate-400">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher (pommes, services...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="priceAsc">💰 Prix croissant (Moins cher)</option>
                <option value="priceDesc">💎 Prix décroissant</option>
                <option value="recent">📅 Plus récents</option>
              </select>
            </div>

            {/* TAGS CATÉGORIES */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* GRILLE PRODUITS */}
            {loading ? (
              <div className="text-center py-20 text-slate-400">
                Chargement...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <div className="text-6xl mb-4">🥕</div>
                <h3 className="text-xl font-bold text-slate-700">
                  Aucun produit trouvé.
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const isBestPrice =
                    product.price === getMinPrice(product.category) &&
                    product.price > 0;

                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all flex flex-col h-full group relative"
                    >
                      {isBestPrice && (
                        <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-full shadow-sm flex items-center gap-1 z-10">
                          <Star size={12} fill="currentColor" /> MEILLEUR PRIX
                        </div>
                      )}
                      <div className="h-40 bg-slate-50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                        {product.category === 'Alimentaire'
                          ? '🥦'
                          : product.category === 'Bureau'
                          ? '✏️'
                          : product.category === 'Services'
                          ? '🔧'
                          : '📦'}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                          Vendu par {product.producer || 'Fournisseur'}
                        </p>
                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <span className="block text-xs text-slate-400">
                              Prix
                            </span>
                            <span className="font-bold text-xl text-slate-900">
                              {product.price}$
                              <span className="text-sm font-normal text-slate-400">
                                /{product.unit}
                              </span>
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(product);
                              alert('Ajouté !');
                            }}
                            className="h-10 px-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-emerald-600 transition shadow-md flex items-center gap-2"
                            type="button"
                          >
                            Ajouter +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB : COMMANDES (look B2B) */}
        {activeTab === 'orders' && (
          <div className="max-w-5xl mx-auto">
            <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  Mes commandes B2B
                </h1>
                <p className="text-slate-500 text-sm">
                  Vue d&apos;ensemble des commandes passées via Forfeo Market.
                </p>
              </div>

              {orders.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <TrendingUp size={14} />
                  <span>
                    {orders.length} commande{orders.length > 1 ? 's' : ''} au total
                  </span>
                </div>
              )}
            </header>

            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-slate-100">
                <div className="text-5xl mb-3">📦</div>
                <p className="font-bold text-slate-700 mb-1">
                  Aucune commande pour le moment.
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  Dès que vous passerez des commandes via le marché, elles apparaîtront ici
                  avec le montant, la date et le statut.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-emerald-600 transition"
                >
                  Explorer le marché
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* En-tête de tableau (desktop) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wide bg-slate-50">
                  <div className="col-span-3">Commande</div>
                  <div className="col-span-3">Articles</div>
                  <div className="col-span-2 text-right">Montant</div>
                  <div className="col-span-2 text-center">Statut</div>
                  <div className="col-span-2 text-right">Date</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {orders.map((o) => {
                    const itemsCount = o.items ? o.items.length : 0;
                    const status = o.status || 'pending';

                    let statusLabel = 'En cours';
                    let statusClass =
                      'bg-amber-50 text-amber-700 border border-amber-100';

                    if (status === 'paid') {
                      statusLabel = 'Payée';
                      statusClass =
                        'bg-emerald-50 text-emerald-700 border border-emerald-100';
                    } else if (status === 'cancelled' || status === 'canceled') {
                      statusLabel = 'Annulée';
                      statusClass =
                        'bg-red-50 text-red-700 border border-red-100';
                    } else if (status === 'completed') {
                      statusLabel = 'Complétée';
                      statusClass =
                        'bg-blue-50 text-blue-700 border border-blue-100';
                    }

                    return (
                      <div
                        key={o.id}
                        className="px-4 sm:px-6 py-4 flex flex-col gap-3 md:grid md:grid-cols-12 md:items-center"
                      >
                        {/* Col 1 : ID + résumé */}
                        <div className="md:col-span-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              #{String(o.id).slice(0, 8)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Commande acheteur
                          </p>
                        </div>

                        {/* Col 2 : articles */}
                        <div className="md:col-span-3 text-xs text-slate-600">
                          {itemsCount === 0 && (
                            <span className="italic text-slate-400">
                              Aucun détail d&apos;article
                            </span>
                          )}
                          {itemsCount > 0 && (
                            <>
                              <p className="font-semibold mb-1">
                                {itemsCount} article{itemsCount > 1 ? 's' : ''}
                              </p>
                              <p className="line-clamp-2">
                                {o.items
                                  .map((it) => it.product?.name)
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Col 3 : montant */}
                        <div className="md:col-span-2 md:text-right text-sm font-bold text-emerald-700">
                          {Number(o.total_amount || 0).toFixed(2)}$
                        </div>

                        {/* Col 4 : statut */}
                        <div className="md:col-span-2 md:text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>

                        {/* Col 5 : date */}
                        <div className="md:col-span-2 md:text-right text-xs text-slate-500">
                          {o.created_at &&
                            new Date(o.created_at).toLocaleDateString(
                              'fr-CA',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: '2-digit',
                              }
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB : PARAMÈTRES / PROFIL */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Mon Profil</h1>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 border rounded-xl"
                    value={profile.company_name}
                    onChange={e =>
                      setProfile({ ...profile, company_name: e.target.value })
                    }
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    className="w-full p-4 border rounded-xl"
                    value={profile.address_line1}
                    onChange={e =>
                      setProfile({ ...profile, address_line1: e.target.value })
                    }
                    placeholder="Adresse"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    className="w-full p-4 border rounded-xl"
                    value={profile.city}
                    onChange={e =>
                      setProfile({ ...profile, city: e.target.value })
                    }
                    placeholder="Ville"
                  />
                  <input
                    type="text"
                    className="w-full p-4 border rounded-xl"
                    value={profile.postal_code}
                    onChange={e =>
                      setProfile({ ...profile, postal_code: e.target.value })
                    }
                    placeholder="Code Postal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition shadow-lg"
                >
                  {saving ? '...' : 'Sauvegarder'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${
      active
        ? 'bg-emerald-800 text-white shadow-lg translate-x-1'
        : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white'
    }`}
    type="button"
  >
    <div className={active ? 'text-white' : 'text-emerald-300'}>{icon}</div>
    <span>{label}</span>
  </button>
);

export default MerchantDashboard;

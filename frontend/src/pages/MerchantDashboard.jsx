import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useCart } from '../context/CartContext';
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  User,
  LogOut,
  Star,
  TrendingUp,
  Filter,
} from 'lucide-react';

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

  // Vue (cartes vs comparateur tableau)
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'compare'

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      .not('supplier_id', 'is', null)
      .order('created_at', { ascending: false });

    if (productsData) setProducts(productsData);

    // 2. Commandes de l’acheteur
    const { data: ordersData } = await supabase
      .from('orders')
      .select(
        `*,
         items: order_items (
           quantity,
           price_at_purchase,
           product: products (name)
         )`
      )
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
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', user.id);
    if (error) alert('Erreur: ' + error.message);
    else alert('Profil mis à jour ! ✅');
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // -----------------------------
  // 📊 KPIs B2B (dépenses, commandes, fournisseurs)
  // -----------------------------
  const {
    totalSpent,
    monthSpent,
    ordersCount,
    uniqueSuppliersCount,
  } = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalSpent: 0,
        monthSpent: 0,
        ordersCount: 0,
        uniqueSuppliersCount: 0,
      };
    }

    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);

    let total = 0;
    let monthTotal = 0;
    const suppliersSet = new Set();

    for (const o of orders) {
      const amt = Number(o.total_amount) || 0;
      total += amt;

      const created = o.created_at ? new Date(o.created_at) : null;
      if (created && created >= monthAgo) {
        monthTotal += amt;
      }

      if (o.supplier_id) suppliersSet.add(o.supplier_id);
    }

    return {
      totalSpent: total,
      monthSpent: monthTotal,
      ordersCount: orders.length,
      uniqueSuppliersCount: suppliersSet.size,
    };
  }, [orders]);

  // -----------------------------
  // Tri & filtres catalogue
  // -----------------------------
  const categories = ['Tout', 'Alimentaire', 'Bureau', 'Équipement', 'Services', 'Autre'];

  const getMinPrice = (cat) => {
    const prods = products.filter((p) => p.category === cat);
    return prods.length ? Math.min(...prods.map((p) => p.price)) : 0;
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (p) => selectedCategory === 'Tout' || p.category === selectedCategory
      )
      .filter((p) =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        return new Date(b.created_at) - new Date(a.created_at);
      });
  }, [products, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col md:flex-row text-slate-900">
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full bg-emerald-900 text-white z-30 flex justify-between items-center p-4 shadow-md">
        <span className="font-bold text-lg flex items-center gap-2">
          🌱 Forfeo Market
        </span>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/cart')} className="relative">
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
            onClick={() => {
              setActiveTab('catalog');
              setMobileMenuOpen(false);
            }}
            icon={<ShoppingBag size={20} />}
            label="Marché Local"
          />
          <NavButton
            active={activeTab === 'orders'}
            onClick={() => {
              setActiveTab('orders');
              setMobileMenuOpen(false);
            }}
            icon={<TrendingUp size={20} />}
            label="Mes Commandes"
          />
          <NavButton
            active={activeTab === 'settings'}
            onClick={() => {
              setActiveTab('settings');
              setMobileMenuOpen(false);
            }}
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
        {/* --- ONGLET MARCHÉ LOCAL --- */}
        {activeTab === 'catalog' && (
          <div className="max-w-7xl mx-auto">
            {/* Header + baseline */}
            <header className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Le Marché Local
              </h1>
              <p className="text-slate-500">
                Comparez les prix en temps réel et centralisez vos achats B2B.
              </p>
            </header>

            {/* 📊 KPIs Acheteur */}
            <section className="grid md:grid-cols-4 gap-3 mb-6">
              <KpiCard
                label="Dépenses ce mois-ci"
                value={`${monthSpent.toFixed(2)} $`}
                helper="Commandes passées dans les 30 derniers jours"
              />
              <KpiCard
                label="Total des commandes"
                value={`${totalSpent.toFixed(2)} $`}
                helper={`${ordersCount} commande(s) au total`}
              />
              <KpiCard
                label="Fournisseurs actifs"
                value={uniqueSuppliersCount}
                helper="Ayant au moins une commande"
              />
              <KpiCard
                label="Articles en catalogue"
                value={products.length}
                helper="Produits actuellement disponibles"
              />
            </section>

            {/* FILTRES & RECHERCHE + VUE */}
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

              {/* Toggle vue cartes / comparateur */}
              <div className="flex items-center gap-2">
                <span className="hidden md:inline text-xs font-semibold text-slate-400">
                  Vue
                </span>
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1 rounded-lg ${
                      viewMode === 'cards'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    Cartes
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('compare')}
                    className={`px-3 py-1 rounded-lg ${
                      viewMode === 'compare'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    Comparateur
                  </button>
                </div>
              </div>
            </div>

            {/* TAGS CATÉGORIES */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
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

            {/* CONTENU CATALOGUE */}
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
                <p className="text-sm text-slate-500 mt-1">
                  Ajustez la catégorie ou votre recherche pour voir plus
                  d’options.
                </p>
              </div>
            ) : viewMode === 'cards' ? (
              /* Vue CARTES (ta vue actuelle améliorée) */
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
                          <span className="text-[11px] text-slate-400 font-mono">
                            Stock : {product.stock ?? 0}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 mb-2">
                          Vendu par {product.producer || 'Fournisseur'}
                        </p>

                        {/* Infos B2B rapides (placeholder pour l’instant) */}
                        <p className="text-[11px] text-slate-400 mb-3">
                          Livraison estimée :{' '}
                          <span className="font-semibold">24–72h</span> · Zone :{' '}
                          <span className="font-semibold">Québec & environs</span>
                        </p>

                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <span className="block text-xs text-slate-400">
                              Prix
                            </span>
                            <span className="font-bold text-xl text-slate-900">
                              {product.price}$ {' '}
                              <span className="text-sm font-normal text-slate-400">
                                /{product.unit}
                              </span>
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(product);
                              alert('Ajouté au panier !');
                            }}
                            className="h-10 px-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-emerald-600 transition shadow-md flex items-center gap-2"
                          >
                            Ajouter +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Vue COMPARATEUR (tableau) */
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Filter size={16} />
                    <span>
                      Comparateur de fournisseurs –{' '}
                      <span className="font-semibold">
                        {filteredProducts.length} offre(s)
                      </span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    Astuce : triez par prix, repérez le badge “MEILLEUR PRIX”,
                    puis ajoutez au panier.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px]">
                      <tr>
                        <th className="text-left px-4 py-3">Produit</th>
                        <th className="text-left px-4 py-3">Fournisseur</th>
                        <th className="text-left px-4 py-3">Catégorie</th>
                        <th className="text-right px-4 py-3">Prix / unité</th>
                        <th className="text-right px-4 py-3">Stock</th>
                        <th className="text-right px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const isBestPrice =
                          product.price === getMinPrice(product.category) &&
                          product.price > 0;
                        return (
                          <tr
                            key={product.id}
                            className="border-t border-slate-100 hover:bg-slate-50/60"
                          >
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">
                                {product.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {product.unit
                                  ? `Format : ${product.unit}`
                                  : 'Format non précisé'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-slate-800">
                                {product.producer || 'Fournisseur local'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Livraison estimée 24–72h
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                                {product.category || 'Divers'}
                                {isBestPrice && (
                                  <span className="flex items-center gap-1 text-[10px] text-yellow-700">
                                    <Star size={10} fill="currentColor" /> Best
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div
                                className={`font-bold ${
                                  isBestPrice
                                    ? 'text-emerald-700'
                                    : 'text-slate-900'
                                }`}
                              >
                                {product.price.toFixed(2)} $
                              </div>
                              <div className="text-[11px] text-slate-400">
                                / {product.unit || 'unité'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-xs text-slate-700 font-semibold">
                                {product.stock ?? 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  addToCart(product);
                                  alert('Ajouté au panier !');
                                }}
                                className="inline-flex items-center justify-center h-9 px-3 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-emerald-600 transition shadow-sm"
                              >
                                Ajouter +
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ONGLET COMMANDES --- */}
        {activeTab === 'orders' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Mes Commandes</h1>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center shadow-sm">
                  <p className="font-bold text-slate-500">
                    Aucune commande pour le moment.
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Passez par le Marché Local pour créer votre première
                    commande.
                  </p>
                </div>
              ) : (
                orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          #{String(o.id).slice(0, 8)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                          {o.status || 'En traitement'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {o.created_at
                          ? new Date(o.created_at).toLocaleDateString()
                          : ''}
                      </p>
                    </div>
                    <div className="flex-1 md:px-8">
                      <p className="text-sm font-medium text-slate-700">
                        {o.items?.length || 0} article(s)
                      </p>
                      {o.items && o.items.length > 0 && (
                        <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">
                          {o.items
                            .map((it) => it.product?.name)
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-700">
                        {Number(o.total_amount || 0).toFixed(2)}$
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Terme : {o.payment_term || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- ONGLET PARAMÈTRES / PROFIL --- */}
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
                    onChange={(e) =>
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
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        address_line1: e.target.value,
                      })
                    }
                    placeholder="Adresse"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    className="w-full p-4 border rounded-xl"
                    value={profile.city}
                    onChange={(e) =>
                      setProfile({ ...profile, city: e.target.value })
                    }
                    placeholder="Ville"
                  />
                  <input
                    type="text"
                    className="w-full p-4 border rounded-xl"
                    value={profile.postal_code}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        postal_code: e.target.value,
                      })
                    }
                    placeholder="Code Postal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-emerald-600 transition shadow-lg disabled:opacity-60"
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
  >
    <div className={active ? 'text-white' : 'text-emerald-300'}>{icon}</div>
    <span>{label}</span>
  </button>
);

const KpiCard = ({ label, value, helper }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col">
    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
      {label}
    </span>
    <span className="mt-1 text-xl font-extrabold text-slate-900">
      {value}
    </span>
    {helper && (
      <span className="mt-1 text-[11px] text-slate-400">{helper}</span>
    )}
  </div>
);

export default MerchantDashboard;

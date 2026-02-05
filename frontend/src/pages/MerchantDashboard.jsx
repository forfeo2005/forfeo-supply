// frontend/src/pages/MerchantDashboard.jsx
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
  ChevronRight,
  Home,
  Package,
  Settings,
  ShoppingCart,
  Bell,
  Calendar,
  DollarSign,
  Users,
} from 'lucide-react';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState('content'); // 'content' | 'menu'
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
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;
      if (!currentUser) return navigate('/login');
      setUser(currentUser);
      fetchData(currentUser.id);
    };
    initData();
  }, [navigate]);

  const fetchData = async (userId) => {
    setLoading(true);

    // 1. Catalogue
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .gt('stock', 0)
      .not('supplier_id', 'is', null)
      .order('created_at', { ascending: false });

    if (productsData) setProducts(productsData);

    // 2. Commandes de l'acheteur
    const { data: ordersData } = await supabase
      .from('orders')
      .select(
        `*,
         items: order_items (
           quantity,
           price_at_purchase,
           product: products (name, supplier_id)
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

  // KPIs B2B
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

      if (Array.isArray(o.items)) {
        o.items.forEach((it) => {
          if (it.product?.supplier_id) suppliersSet.add(it.product.supplier_id);
        });
      }
    }

    return {
      totalSpent: total,
      monthSpent: monthTotal,
      ordersCount: orders.length,
      uniqueSuppliersCount: suppliersSet.size,
    };
  }, [orders]);

  // Tri & filtres catalogue
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

  // Navigation mobile
  const handleMobileNavClick = (tab) => {
    setActiveTab(tab);
    setMobileView('content');
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* TOP BAR MOBILE - TOUJOURS VISIBLE */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 flex justify-between items-center p-4 shadow-sm">
        <button
          onClick={() => setMobileView('menu')}
          className="p-2 rounded-lg hover:bg-slate-100"
        >
          <Menu size={24} className="text-slate-700" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-slate-800">Tableau de bord</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2 rounded-lg hover:bg-slate-100"
          >
            <ShoppingCart size={22} className="text-slate-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100">
            <Bell size={22} className="text-slate-700" />
          </button>
        </div>
      </div>

      {/* MENU MOBILE OVERLAY */}
      {mobileView === 'menu' && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          {/* Header du menu mobile */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-600 font-bold">F</span>
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Espace Acheteur</h2>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setMobileView('content')}
              className="p-2 rounded-lg hover:bg-slate-100"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation mobile */}
          <nav className="p-4 space-y-1">
            <MobileNavItem
              icon={<Home size={20} />}
              label="Vue d'ensemble"
              active={activeTab === 'overview'}
              onClick={() => handleMobileNavClick('overview')}
            />
            <MobileNavItem
              icon={<Package size={20} />}
              label="Marché Local"
              active={activeTab === 'catalog'}
              onClick={() => handleMobileNavClick('catalog')}
            />
            <MobileNavItem
              icon={<ShoppingBag size={20} />}
              label="Mes Commandes"
              active={activeTab === 'orders'}
              onClick={() => handleMobileNavClick('orders')}
            />
            <MobileNavItem
              icon={<User size={20} />}
              label="Mon Profil"
              active={activeTab === 'settings'}
              onClick={() => handleMobileNavClick('settings')}
            />
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => navigate('/cart')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold mb-2"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} /> Panier
                </div>
                {cartCount > 0 && (
                  <span className="bg-emerald-600 text-white text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-3 rounded-xl text-red-600 hover:bg-red-50 font-medium"
              >
                <LogOut size={20} /> Déconnexion
              </button>
            </div>
          </nav>

          {/* KPIs rapides dans le menu mobile */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Vue rapide</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500">Dépenses du mois</p>
                <p className="font-bold text-slate-900">{monthSpent.toFixed(2)} $</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500">Commandes</p>
                <p className="font-bold text-slate-900">{ordersCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:flex fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 z-40 flex-col">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-emerald-600 font-bold text-lg">F</span>
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">Forfeo</h2>
            <p className="text-xs text-emerald-600 font-medium uppercase">Espace Acheteur</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<Home size={20} />}
            label="Vue d'ensemble"
          />
          <NavButton
            active={activeTab === 'catalog'}
            onClick={() => setActiveTab('catalog')}
            icon={<Package size={20} />}
            label="Marché Local"
          />
          <NavButton
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            icon={<ShoppingBag size={20} />}
            label="Mes Commandes"
          />
          <NavButton
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={<User size={20} />}
            label="Mon Profil"
          />
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => navigate('/cart')}
            className="w-full flex items-center justify-between bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl font-bold mb-3 shadow-sm transition"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} /> Panier
            </div>
            {cartCount > 0 && (
              <span className="bg-white text-emerald-700 text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-3 text-slate-600 hover:bg-slate-100 rounded-xl transition text-sm font-medium"
          >
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <main className={`pt-16 md:pt-0 md:pl-72 ${mobileView === 'menu' ? 'hidden' : 'block'}`}>
        {/* --- ONGLET VUE D'ENSEMBLE --- */}
        {activeTab === 'overview' && (
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header avec titre et sous-titre */}
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Tableau de bord achats
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Vue globale de vos dépenses, commandes et fournisseurs.
              </p>
            </div>

            {/* KPIs - Version responsive */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCardMobile
                label="Dépenses mois"
                value={`${monthSpent.toFixed(2)} $`}
                icon={<DollarSign size={16} />}
                color="bg-emerald-50 text-emerald-700"
              />
              <KpiCardMobile
                label="Total commandes"
                value={`${totalSpent.toFixed(2)} $`}
                icon={<Calendar size={16} />}
                color="bg-blue-50 text-blue-700"
              />
              <KpiCardMobile
                label="Fournisseurs"
                value={uniqueSuppliersCount}
                icon={<Users size={16} />}
                color="bg-purple-50 text-purple-700"
              />
              <KpiCardMobile
                label="Articles"
                value={products.length}
                icon={<Package size={16} />}
                color="bg-amber-50 text-amber-700"
              />
            </div>

            {/* Dernières commandes + CTA marché */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-4 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Dernières commandes
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-600 flex items-center gap-1"
                  >
                    Voir tout <ChevronRight size={12} />
                  </button>
                </div>
                
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-sm text-slate-500">
                      Aucune commande pour le moment.
                    </p>
                    <button
                      onClick={() => setActiveTab('catalog')}
                      className="mt-3 text-sm text-emerald-600 font-bold"
                    >
                      Explorer le marché →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="p-3 rounded-xl border border-slate-100 hover:border-emerald-200 transition">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              Commande #{String(o.id).slice(0, 8)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {o.created_at
                                ? new Date(o.created_at).toLocaleDateString()
                                : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-700">
                              {Number(o.total_amount || 0).toFixed(2)} $
                            </p>
                            <span className={`text-[10px] px-2 py-1 rounded-full ${
                              o.status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {o.status || 'En traitement'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Marché */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl p-5 md:p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide mb-2">
                    Centraliser vos achats
                  </h3>
                  <p className="text-sm text-emerald-50 mb-3">
                    Utilisez le comparateur Forfeo pour challenger vos prix,
                    sécuriser vos approvisionnements et gagner du temps.
                  </p>
                  <p className="text-xs text-emerald-100">
                    Comparez les offres de plusieurs fournisseurs en quelques clics.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className="mt-6 w-full bg-white hover:bg-slate-100 text-emerald-700 font-bold text-sm py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <Package size={16} /> Ouvrir le Marché
                </button>
              </div>
            </div>

            {/* Accès rapide mobile */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('catalog')}
                className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center"
              >
                <Package size={24} className="text-emerald-600 mb-2" />
                <span className="text-sm font-bold text-slate-800">Marché</span>
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center"
              >
                <ShoppingCart size={24} className="text-emerald-600 mb-2" />
                <span className="text-sm font-bold text-slate-800">Panier</span>
                {cartCount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* --- ONGLET MARCHÉ LOCAL --- */}
        {activeTab === 'catalog' && (
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Le Marché Local
              </h1>
              <p className="text-slate-500">
                Comparez les prix en temps réel et centralisez vos achats B2B.
              </p>
            </div>

            {/* Filtres mobiles simplifiés */}
            <div className="md:hidden space-y-3 mb-6">
              <div className="relative">
                <div className="absolute left-3 top-3 text-slate-400">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtres desktop */}
            <div className="hidden md:block bg-white p-4 rounded-2xl shadow-sm mb-8 border border-slate-100">
              <div className="flex flex-col md:flex-row gap-4">
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
                  <option value="priceAsc">💰 Prix croissant</option>
                  <option value="priceDesc">💎 Prix décroissant</option>
                  <option value="recent">📅 Plus récents</option>
                </select>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">
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
                  Ajustez la catégorie ou votre recherche.
                </p>
              </div>
            ) : viewMode === 'cards' ? (
              /* Vue CARTES - Responsive */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => {
                  const isBestPrice =
                    product.price === getMinPrice(product.category) &&
                    product.price > 0;
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all flex flex-col h-full"
                    >
                      <div className="relative">
                        <div className="h-32 md:h-40 bg-slate-50 flex items-center justify-center text-4xl md:text-5xl">
                          {product.category === 'Alimentaire'
                            ? '🥦'
                            : product.category === 'Bureau'
                            ? '✏️'
                            : product.category === 'Services'
                            ? '🔧'
                            : '📦'}
                        </div>
                        {isBestPrice && (
                          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1">
                            <Star size={10} /> MEILLEUR PRIX
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 md:p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            {product.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Stock: {product.stock ?? 0}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-base md:text-lg text-slate-800 mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 mb-2">
                          {product.producer || 'Fournisseur'}
                        </p>

                        <div className="mt-auto pt-3 md:pt-4 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <span className="block text-xs text-slate-400">
                              Prix
                            </span>
                            <span className="font-bold text-lg md:text-xl text-slate-900">
                              {product.price}$
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
                            className="h-9 md:h-10 px-3 md:px-4 rounded-lg md:rounded-xl font-bold text-xs md:text-sm bg-slate-900 text-white hover:bg-emerald-600 transition shadow-sm flex items-center gap-1"
                          >
                            <ShoppingCart size={14} /> Ajouter
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Vue COMPARATEUR - Version mobile simplifiée */
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Filter size={16} />
                    <span>
                      {filteredProducts.length} offre(s)
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const isBestPrice = product.price === getMinPrice(product.category);
                    return (
                      <div key={product.id} className="p-4 hover:bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900">
                                {product.name}
                              </h4>
                              {isBestPrice && (
                                <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Star size={8} /> Best
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mb-2">
                              {product.producer || 'Fournisseur'}
                            </p>
                            <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full mb-2">
                              {product.category || 'Divers'}
                            </span>
                          </div>
                          
                          <div className="text-right">
                            <div className={`font-bold ${isBestPrice ? 'text-emerald-700' : 'text-slate-900'}`}>
                              {product.price.toFixed(2)} $
                            </div>
                            <div className="text-[11px] text-slate-400">
                              / {product.unit || 'unité'}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Stock: {product.stock ?? 0}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            addToCart(product);
                            alert('Ajouté au panier !');
                          }}
                          className="mt-3 w-full h-9 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                        >
                          <ShoppingCart size={14} /> Ajouter au panier
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ONGLET COMMANDES --- */}
        {activeTab === 'orders' && (
          <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Mes Commandes</h1>
              <p className="text-sm text-slate-500 mt-1">
                {orders.length} commande(s) au total
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white p-8 md:p-12 rounded-2xl text-center shadow-sm">
                <div className="text-6xl mb-4">📦</div>
                <p className="font-bold text-slate-700">
                  Aucune commande pour le moment.
                </p>
                <p className="text-sm text-slate-500 mt-2 mb-4">
                  Passez par le Marché Local pour créer votre première commande.
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-sm"
                >
                  Explorer le marché
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100"
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded">
                            #{String(o.id).slice(0, 8)}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            o.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {o.status || 'En traitement'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">
                          {o.created_at
                            ? new Date(o.created_at).toLocaleDateString('fr-CA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : ''}
                        </p>
                      </div>
                      
                      <div className="flex-1 md:px-4">
                        <p className="text-sm font-medium text-slate-700">
                          {o.items?.length || 0} article(s)
                        </p>
                        {o.items && o.items.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
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
                        <p className="text-xs text-slate-500 mt-1">
                          {o.payment_term || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Détails supplémentaires mobile */}
                    <div className="mt-4 pt-4 border-t border-slate-100 md:hidden">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-400">Articles</p>
                          <p className="text-sm font-medium">{o.items?.length || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Terme de paiement</p>
                          <p className="text-sm font-medium">{o.payment_term || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- ONGLET PROFIL --- */}
        {activeTab === 'settings' && (
          <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
            <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
              <p className="text-sm text-slate-500 mt-1">
                Gérez les informations de votre entreprise
              </p>
            </div>

            <div className="bg-white p-4 md:p-8 rounded-2xl shadow-lg border border-slate-100">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 md:p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    className="w-full p-3 md:p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      className="w-full p-3 md:p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={profile.city}
                      onChange={(e) =>
                        setProfile({ ...profile, city: e.target.value })
                      }
                      placeholder="Ville"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="w-full p-3 md:p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
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
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 md:p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 md:py-4 rounded-xl transition shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Composants réutilisables
const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${
      active
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    <div className={active ? 'text-emerald-600' : 'text-slate-400'}>{icon}</div>
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-xl ${
      active
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'text-slate-700 hover:bg-slate-50'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={active ? 'text-emerald-600' : 'text-slate-500'}>{icon}</div>
      <span className="font-medium">{label}</span>
    </div>
    <ChevronRight size={16} className={active ? 'text-emerald-600' : 'text-slate-400'} />
  </button>
);

const KpiCardMobile = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      <div className={`p-1.5 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
    <span className="text-lg font-extrabold text-slate-900">
      {value}
    </span>
  </div>
);

export default MerchantDashboard;

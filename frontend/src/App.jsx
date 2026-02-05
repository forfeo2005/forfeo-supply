import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import des composants
import Header from './components/Header';
import Footer from './components/Footer';

// Pages publiques
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import About from './pages/About';
import Login from './pages/Login';
import Privacy from './pages/Privacy';
import Cart from './pages/Cart';
import Success from './pages/Success';
import Resources from './pages/Resources';
import ResourceDetail from './pages/ResourceDetail';

// Dashboards (sans layout public)
import Dashboard from './pages/Dashboard';
import MerchantDashboard from './pages/MerchantDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Layout standard pour les pages publiques
const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          {/* 1. ROUTES DASHBOARD (isolées, sans Layout public) */}
          <Route path="/admin" element={<AdminDashboard />} />        {/* Espace Admin */}
          <Route path="/dashboard" element={<Dashboard />} />         {/* Ancien espace / Dashboard générique */}
          <Route path="/merchant" element={<MerchantDashboard />} />  {/* Espace acheteur / comparateur */}

          {/* 2. ROUTES PUBLIQUES (avec Header + Footer via Layout) */}
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/market"
            element={
              <Layout>
                <Marketplace />
              </Layout>
            }
          />
          <Route
            path="/about"
            element={
              <Layout>
                <About />
              </Layout>
            }
          />
          <Route
            path="/login"
            element={
              <Layout>
                <Login />
              </Layout>
            }
          />

          {/* Page Ressources / Blog B2B */}
          <Route
            path="/resources"
            element={
              <Layout>
                <Resources />
              </Layout>
            }
          />

          {/* Détail d’un article : /resources/:slug */}
          <Route
            path="/resources/:slug"
            element={
              <Layout>
                <ResourceDetail />
              </Layout>
            }
          />

          {/* 3. Panier */}
          <Route
            path="/cart"
            element={
              <Layout>
                <Cart />
              </Layout>
            }
          />

          {/* 4. Succès paiement (retour Stripe) */}
          <Route
            path="/success"
            element={
              <Layout>
                <Success />
              </Layout>
            }
          />

          {/* 5. Confidentialité / légal */}
          <Route
            path="/privacy"
            element={
              <Layout>
                <Privacy />
              </Layout>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

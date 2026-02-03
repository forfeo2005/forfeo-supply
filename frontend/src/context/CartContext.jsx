import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';

// Création du contexte
const CartContext = createContext(null);

// Hook personnalisé pour utiliser le panier facilement partout
export const useCart = () => useContext(CartContext);

// Helpers SAFE
const isBrowser = typeof window !== 'undefined';

const safeParseJSON = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    return fallback;
  }
};

const normalizeItem = (item) => {
  // On garde toutes les props du produit, on normalise seulement price/quantity
  const price = Number(item?.price ?? 0);
  const quantity = Number(item?.quantity ?? 1);

  return {
    ...item,
    price: Number.isFinite(price) ? price : 0,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
  };
};

// Le fournisseur du panier (à mettre autour de l'application)
export const CartProvider = ({ children }) => {
  // 1) On initialise le panier en vérifiant s'il y a déjà quelque chose dans le navigateur (LocalStorage)
  const [cart, setCart] = useState(() => {
    if (!isBrowser) return [];
    const savedCart = window.localStorage.getItem('forfeo_cart');
    const parsed = safeParseJSON(savedCart, []);
    // Normalisation (évite NaN / quantity invalide)
    return Array.isArray(parsed) ? parsed.map(normalizeItem) : [];
  });

  // 2) À chaque modification du panier, on sauvegarde dans le LocalStorage
  useEffect(() => {
    if (!isBrowser) return;
    window.localStorage.setItem('forfeo_cart', JSON.stringify(cart));
  }, [cart]);

  // --- FONCTIONS DU PANIER ---

  // Ajouter un produit
  const addToCart = (product) => {
    if (!product || product.id == null) return;

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        // Si oui, on augmente la quantité (+1)
        return prevCart.map((item) =>
          item.id === product.id
            ? normalizeItem({ ...item, quantity: Number(item.quantity) + 1 })
            : item
        );
      }

      // Sinon, on l'ajoute avec une quantité de 1
      return [...prevCart, normalizeItem({ ...product, quantity: 1 })];
    });
  };

  // Retirer un produit
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Modifier la quantité manuellement (+ ou -)
  const updateQuantity = (productId, newQuantity) => {
    const qty = Number(newQuantity);
    if (!Number.isFinite(qty) || qty < 1) return; // On empêche d'avoir 0, négatif, ou NaN

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? normalizeItem({ ...item, quantity: qty }) : item
      )
    );
  };

  // Vider le panier complet (après paiement)
  const clearCart = () => setCart([]);

  // --- CALCULS AUTOMATIQUES ---
  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cart]);

  // Prix total du panier (string comme avant grâce à toFixed)
  const cartTotal = useMemo(() => {
    const total = cart.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + price * qty;
    }, 0);

    return total.toFixed(2);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

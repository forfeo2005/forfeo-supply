import React, { createContext, useState, useContext, useEffect } from 'react';

// Création du contexte
const CartContext = createContext();

// Hook personnalisé pour utiliser le panier facilement partout
export const useCart = () => useContext(CartContext);

// Le fournisseur du panier (à mettre autour de l'application)
export const CartProvider = ({ children }) => {
  
  // 1. On initialise le panier en vérifiant s'il y a déjà quelque chose dans le navigateur (LocalStorage)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('forfeo_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. À chaque modification du panier, on sauvegarde dans le LocalStorage
  useEffect(() => {
    localStorage.setItem('forfeo_cart', JSON.stringify(cart));
  }, [cart]);

  // --- FONCTIONS DU PANIER ---

  // Ajouter un produit
  const addToCart = (product) => {
    setCart(prevCart => {
      // On vérifie si le produit est déjà dedans
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Si oui, on augmente la quantité (+1)
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Sinon, on l'ajoute avec une quantité de 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Retirer un produit
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Modifier la quantité manuellement (+ ou -)
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return; // On empêche d'avoir 0 ou négatif
    setCart(prevCart =>
      prevCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item)
    );
  };

  // Vider le panier complet (après paiement)
  const clearCart = () => setCart([]);

  // --- CALCULS AUTOMATIQUES ---
  
  // Nombre total d'articles (pour le badge rouge sur l'icône)
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  // Prix total du panier
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      cartTotal 
    }}>
      {children}
    </CartContext.Provider>
  );
};

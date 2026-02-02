import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // On essaie de récupérer le panier sauvegardé dans le navigateur (LocalStorage)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('forfeo_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // À chaque fois que le panier change, on sauvegarde dans le navigateur
  useEffect(() => {
    localStorage.setItem('forfeo_cart', JSON.stringify(cart));
  }, [cart]);

  // FONCTION : Ajouter au panier
  const addToCart = (product) => {
    setCart(prevCart => {
      // Est-ce que le produit est déjà là ?
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Si oui, on augmente juste la quantité (+1)
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Sinon, on l'ajoute avec quantité 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    // Petit effet visuel ou log pour confirmer
    console.log("Ajouté au panier:", product.name);
  };

  // FONCTION : Retirer un article
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // FONCTION : Changer la quantité manuellement
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item)
    );
  };

  // FONCTION : Vider le panier (après commande)
  const clearCart = () => setCart([]);

  // CALCULS
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
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

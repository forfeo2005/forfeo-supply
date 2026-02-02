import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // C'est cette ligne qui charge le design Tailwind
import { CartProvider } from './context/CartContext'; // <--- IMPORT DU PANIER

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* On enveloppe l'App pour que le panier soit accessible partout */}
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>,
)

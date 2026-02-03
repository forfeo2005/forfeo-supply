import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircle, ArrowRight } from 'lucide-react';

const Success = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    // On vide le panier local car le paiement est validé
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl text-center max-w-lg w-full animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Paiement Réussi !</h1>
        <p className="text-slate-500 mb-8">
          Merci pour votre confiance. Votre commande a été transmise au fournisseur. Vous avez reçu une confirmation par courriel.
        </p>
        <button 
          onClick={() => navigate('/merchant')} 
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2"
        >
          Retour au marché <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Success;

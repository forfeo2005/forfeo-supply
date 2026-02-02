import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="font-sans text-slate-900 bg-white">
      
      {/* --- HERO SECTION : VISION --- */}
      <div className="relative bg-slate-900 py-24 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-emerald-400 font-bold tracking-widest text-sm uppercase mb-4 block">Notre Mission</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
            Simplifier la vie des <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
              entrepreneurs d'ici.
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Forfeo Supply n'est plus seulement un marché alimentaire. C'est l'infrastructure numérique qui permet à chaque entreprise du Québec d'acheter et de vendre plus intelligemment.
          </p>
        </div>
      </div>

      {/* --- L'HISTOIRE (DU PIVOT) --- */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          <div className="relative">
            <div className="absolute -inset-4 bg-emerald-100 rounded-full opacity-50 blur-2xl"></div>
            <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-2xl font-bold mb-2">Une évolution nécessaire</h3>
              <p className="text-slate-600">
                Nous avons commencé dans les cuisines des restaurants. Mais nous avons vite réalisé que le problème de la logistique touchait tout le monde : le bureau qui commande du papier, l'hôtel qui cherche des produits d'entretien, et l'usine qui a besoin d'équipement.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 text-slate-900">Le problème du B2B actuel</h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-bold text-xl">⚡</div>
                <div>
                  <h4 className="font-bold text-lg">Trop de fragmentation</h4>
                  <p className="text-slate-500 text-sm">Une entreprise moyenne gère 15 à 40 fournisseurs différents. C'est 40 factures à traiter chaque mois.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center font-bold text-xl">📉</div>
                <div>
                  <h4 className="font-bold text-lg">Opacité des prix</h4>
                  <p className="text-slate-500 text-sm">Difficile de comparer les offres locales. Résultat ? On finit par commander sur des géants étrangers par défaut.</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* --- LA SOLUTION FORFEO --- */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">L'Écosystème Forfeo</h2>
            <p className="text-slate-500 mt-2">Une plateforme unique pour connecter l'économie réelle.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              emoji="🏢" 
              title="Pour les Acheteurs" 
              text="Que vous soyez un restaurant, un bureau ou un atelier : centralisez tous vos achats. Une seule commande, une seule livraison groupée, une seule facture mensuelle."
            />
            <ValueCard 
              emoji="🚚" 
              title="Pour les Fournisseurs" 
              text="Accédez à des milliers d'entreprises clientes sans gérer la prospection. Nous gérons la technologie, la facturation et la logistique du dernier kilomètre."
            />
            <ValueCard 
              emoji="🤖" 
              title="Propulsé par l'IA" 
              text="Notre technologie apprend de vos habitudes. Elle anticipe vos besoins, optimise les stocks et réduit le gaspillage pour tout le réseau."
            />
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          {/* Deco circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Prêt à moderniser votre business ?</h2>
          <p className="text-slate-400 mb-8 text-lg relative z-10">
            Rejoignez les 500+ entreprises québécoises qui ont déjà simplifié leurs opérations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link to="/login" className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-900/50">
              Créer un compte gratuit
            </Link>
            <Link to="/market" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold backdrop-blur-sm transition border border-white/10">
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

const ValueCard = ({ emoji, title, text }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
      {emoji}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">
      {text}
    </p>
  </div>
);

export default About;

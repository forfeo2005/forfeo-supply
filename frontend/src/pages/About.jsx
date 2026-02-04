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
          <span className="text-emerald-400 font-bold tracking-widest text-sm uppercase mb-4 block">
            Notre Mission
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
            Simplifier la vie des <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
              entrepreneurs d&apos;ici.
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Forfeo Supply est une marketplace B2B qui met en relation tous les fournisseurs avec les acheteurs
            professionnels au Québec. Notre objectif : <span className="text-slate-100 font-semibold">
            centraliser les achats, rendre l&apos;offre locale plus visible</span> et faire gagner du temps à chaque entreprise.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/market"
              className="inline-flex justify-center items-center bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-900/40"
            >
              Découvrir le marché B2B
            </Link>
            <Link
              to="/login"
              className="inline-flex justify-center items-center bg-white/10 hover:bg-white/15 border border-white/10 text-white px-6 py-3 rounded-xl font-bold backdrop-blur-sm transition"
            >
              Créer un compte entreprise
            </Link>
          </div>
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
                Nous avons commencé dans les cuisines des restaurants. Mais nous avons vite réalisé que le problème 
                de l&apos;approvisionnement touchait tout le monde : le bureau qui commande du papier, l&apos;hôtel qui cherche 
                des produits d&apos;entretien, l&apos;usine qui a besoin d&apos;équipement, ou le commerce qui veut un nouveau fournisseur.
              </p>
              <p className="text-slate-600 mt-4">
                Forfeo Supply est né d&apos;un constat simple : <span className="font-semibold">
                les acheteurs et les fournisseurs se cherchent encore trop souvent à l&apos;aveugle</span>. 
                Notre rôle est de créer le pont entre eux.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 text-slate-900">Le problème du B2B actuel</h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-bold text-xl">
                  ⚡
                </div>
                <div>
                  <h4 className="font-bold text-lg">Trop de fragmentation</h4>
                  <p className="text-slate-500 text-sm">
                    Une entreprise moyenne gère entre 15 et 40 fournisseurs différents. C&apos;est autant de catalogues à consulter,
                    de prix à comparer, de contacts à gérer, et de factures à traiter chaque mois.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center font-bold text-xl">
                  📉
                </div>
                <div>
                  <h4 className="font-bold text-lg">Opacité des prix et de l&apos;offre locale</h4>
                  <p className="text-slate-500 text-sm">
                    Difficile de savoir quels fournisseurs locaux existent réellement, ce qu&apos;ils offrent et à quelles conditions.
                    Résultat : on finit souvent par commander sur des plateformes géantes, alors que des solutions d&apos;ici existent déjà.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center font-bold text-xl">
                  ⏱
                </div>
                <div>
                  <h4 className="font-bold text-lg">Temps perdu pour les décideurs</h4>
                  <p className="text-slate-500 text-sm">
                    Chaque nouveau besoin implique des appels, des courriels, des soumissions. Autant de temps 
                    qui n&apos;est pas consacré à la stratégie, à l&apos;innovation ou au service client.
                  </p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* --- LA SOLUTION FORFEO : ACHETEURS & FOURNISSEURS --- */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">L&apos;écosystème Forfeo Supply</h2>
            <p className="text-slate-500 mt-2 max-w-3xl mx-auto">
              Une seule plateforme pour connecter les acheteurs professionnels et les fournisseurs locaux, 
              simplifier les achats et rendre l&apos;approvisionnement B2B plus intelligent.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard 
              emoji="🏢" 
              title="Pour les acheteurs" 
              text="Que vous soyez un restaurant, un bureau, un commerce ou une usine : centralisez vos besoins. Recherchez par catégorie ou par usage, comparez les offres locales et réduisez le temps passé à trouver le bon fournisseur."
            />
            <ValueCard 
              emoji="🚚" 
              title="Pour les fournisseurs" 
              text="Accédez à des entreprises prêtes à acheter sans multiplier les démarches commerciales. Mettez vos produits et services en avant, gagnez en visibilité et recevez des demandes qualifiées."
            />
            <ValueCard 
              emoji="🤖" 
              title="Propulsé par l&apos;IA" 
              text="Notre technologie apprend de vos habitudes d&apos;achat. Elle suggère des fournisseurs pertinents, aide à structurer les commandes récurrentes et contribue à réduire le gaspillage et les ruptures."
            />
          </div>

          {/* Bandeau double bénéfices */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Ce que gagne un acheteur</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Une vue claire des fournisseurs disponibles au même endroit.</li>
                <li>• Moins de courriels, de fichiers Excel et de recherches manuelles.</li>
                <li>• Une meilleure comparaison des options locales.</li>
                <li>• Un approvisionnement plus stable et plus prévisible.</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-3">Ce que gagne un fournisseur</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Une vitrine pour présenter ses produits ou services aux décideurs B2B.</li>
                <li>• Moins de temps passé à “chasser” des clients, plus à les servir.</li>
                <li>• Une meilleure compréhension de la demande locale.</li>
                <li>• Une image renforcée comme acteur clé de l&apos;économie d&apos;ici.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          {/* Deco circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
            Prêt à moderniser votre approvisionnement B2B ?
          </h2>
          <p className="text-slate-400 mb-8 text-lg relative z-10">
            Rejoignez les entreprises québécoises qui centralisent déjà leurs recherches de fournisseurs
            sur Forfeo Supply. Acheteurs et fournisseurs se rencontrent ici, plus vite, plus simplement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link
              to="/login"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-900/50"
            >
              Créer un compte gratuit
            </Link>
            <Link
              to="/market"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold backdrop-blur-sm transition border border-white/10"
            >
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

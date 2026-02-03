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
            Notre mission
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
            Simplifier la vie des <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
              entrepreneurs d'ici.
            </span>
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Forfeo Supply met en relation <span className="text-white font-semibold">tous les fournisseurs</span> avec{' '}
            <span className="text-white font-semibold">les acheteurs</span> pour rendre l’approvisionnement B2B plus simple,
            plus rapide et plus local.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/market"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-extrabold transition shadow-lg shadow-emerald-900/50"
            >
              Explorer le catalogue
            </Link>
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-extrabold backdrop-blur-sm transition border border-white/10"
            >
              Créer un compte gratuit
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
              <h3 className="text-2xl font-extrabold mb-2">Pourquoi Forfeo Supply existe</h3>
              <p className="text-slate-600 leading-relaxed">
                On a commencé dans les cuisines des restaurants. Puis on a compris que le même casse-tête existe partout :
                un bureau qui commande du papier, un hôtel qui cherche des produits d’entretien, une usine qui a besoin d’équipement,
                un commerce qui veut comparer des fournisseurs locaux.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">
                Notre but : <span className="font-semibold">réduire la friction</span> entre l’offre et la demande,
                en créant une place unique où les entreprises achètent et vendent plus intelligemment.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold mb-6 text-slate-900">Le problème du B2B aujourd’hui</h2>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-bold text-xl">
                  ⚡
                </div>
                <div>
                  <h4 className="font-extrabold text-lg">Trop de fragmentation</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Une entreprise moyenne gère plusieurs fournisseurs, multiples commandes, suivis et factures. Résultat : du temps perdu,
                    des erreurs et une gestion lourde.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center font-bold text-xl">
                  📉
                </div>
                <div>
                  <h4 className="font-extrabold text-lg">Difficile de comparer</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Les offres sont dispersées, parfois opaques, et les alternatives locales sont difficiles à découvrir. On finit par
                    commander “par habitude” au lieu d’optimiser.
                  </p>
                </div>
              </li>

              <li className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-xl">
                  ✅
                </div>
                <div>
                  <h4 className="font-extrabold text-lg">Une opportunité locale</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Le Québec regorge de fournisseurs solides. Il manquait une plateforme simple qui les rend visibles et accessibles
                    aux entreprises acheteuses.
                  </p>
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
            <h2 className="text-3xl font-extrabold text-slate-900">La solution : une place unique</h2>
            <p className="text-slate-500 mt-2 max-w-3xl mx-auto leading-relaxed">
              Forfeo Supply est une marketplace B2B où l’on centralise l’offre et la demande.
              L’objectif est simple : <span className="font-semibold">mettre en relation tous les fournisseurs avec les acheteurs</span>,
              et rendre l’approvisionnement plus efficace pour tout le monde.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              emoji="🏢"
              title="Pour les acheteurs"
              text="Trouvez des fournisseurs plus vite, comparez les options, et simplifiez vos achats récurrents. Moins de pertes de temps, plus de contrôle."
            />
            <ValueCard
              emoji="🚚"
              title="Pour les fournisseurs"
              text="Gagnez en visibilité auprès d’entreprises québécoises. Présentez vos offres, recevez des demandes et développez votre clientèle sans dépendre du bouche-à-oreille."
            />
            <ValueCard
              emoji="🧠"
              title="Clair, simple, efficace"
              text="Une expérience pensée B2B : recherche rapide, catégories, besoins réels des entreprises, et une plateforme qui s’améliore avec le temps."
            />
          </div>
        </div>
      </section>

      {/* --- COMMENT ÇA MARCHE --- */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Comment ça marche ?</h2>
          <p className="text-slate-500 mt-2 max-w-3xl mx-auto leading-relaxed">
            Que vous achetiez ou que vous vendiez, l’idée est la même : rendre la relation B2B plus simple et plus directe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <StepCard step="1" title="Recherchez" text="Trouvez rapidement ce que votre entreprise cherche : produit, équipement ou service." />
          <StepCard step="2" title="Comparez" text="Découvrez des fournisseurs pertinents, explorez les options et gagnez du temps." />
          <StepCard step="3" title="Connectez" text="Passez à l’action : demande, achat, ou relation d’affaires. Tout commence ici." />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/market"
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-extrabold transition"
          >
            Je suis acheteur
          </Link>
          <Link
            to="/login"
            className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-extrabold transition shadow-lg shadow-emerald-900/20"
          >
            Je suis fournisseur
          </Link>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-slate-900 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 relative z-10">
            Prêt à simplifier votre approvisionnement ?
          </h2>
          <p className="text-slate-400 mb-8 text-lg relative z-10 leading-relaxed">
            Forfeo Supply met en relation tous les fournisseurs avec les acheteurs.
            Rejoignez la plateforme et commencez à acheter ou à vendre plus intelligemment, ici au Québec.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link
              to="/login"
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-extrabold transition shadow-lg shadow-emerald-900/50"
            >
              Créer un compte gratuit
            </Link>
            <Link
              to="/market"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-extrabold backdrop-blur-sm transition border border-white/10"
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
    <h3 className="text-xl font-extrabold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm">
      {text}
    </p>
  </div>
);

const StepCard = ({ step, title, text }) => (
  <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
    <div className="flex items-center gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold">
        {step}
      </span>
      <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
    </div>
    <p className="mt-3 text-slate-600 text-sm leading-relaxed">{text}</p>
  </div>
);

export default About;

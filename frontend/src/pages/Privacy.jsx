import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Politique de Confidentialité</h1>
        <p className="text-emerald-600 font-medium mb-8">Dernière mise à jour : Février 2026 - Conforme Loi 25 (Québec)</p>

        <div className="space-y-8 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Préambule</h2>
            <p>
              La protection de vos renseignements personnels est une priorité pour <strong>FORFEO INC.</strong> (« nous », « Forfeo »). 
              Cette politique vise à respecter les exigences de la <em>Loi sur la protection des renseignements personnels dans le secteur privé</em> (Loi 25) du Québec.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Collecte des Renseignements</h2>
            <p className="mb-2">Dans le cadre de l'exploitation de la plateforme Forfeo Supply, nous collectons les renseignements nécessaires à la relation commerciale B2B :</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Identité :</strong> Nom, prénom des représentants.</li>
              <li><strong>Coordonnées :</strong> Email professionnel, numéro de téléphone, adresse de l'entreprise.</li>
              <li><strong>Données Transactionnelles :</strong> Historique des commandes, facturation, produits favoris.</li>
              <li><strong>Données Techniques :</strong> Adresse IP, logs de connexion, utilisation de l'IA.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Utilisation et Intelligence Artificielle</h2>
            <p>
              Vos données sont utilisées pour fournir le service, facturer et livrer. De plus, Forfeo Supply utilise des algorithmes d'intelligence artificielle pour :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
              <li>Analyser vos habitudes d'approvisionnement.</li>
              <li>Prédire les ruptures de stock.</li>
              <li>Vous suggérer des produits locaux pertinents.</li>
            </ul>
            <p className="mt-2 text-sm italic">Vous pouvez refuser le profilage par IA en nous contactant.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Partage et Hébergement</h2>
            <p>
              Vos données sont hébergées de manière sécurisée (Supabase/Render). Elles ne sont jamais vendues à des tiers. 
              Elles peuvent être partagées avec nos sous-traitants essentiels (ex: Stripe pour les paiements) dans le strict cadre de l'exécution du service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Vos Droits (Loi 25)</h2>
            <p>Vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600">
              <li>Droit d'accès et de rectification de vos données.</li>
              <li>Droit à l'oubli (effacement).</li>
              <li>Droit à la portabilité des données.</li>
              <li>Droit de retirer votre consentement.</li>
            </ul>
          </section>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
            <h3 className="font-bold text-slate-900 mb-2">Responsable de la protection des renseignements personnels</h3>
            <p className="text-sm mb-4">
              Pour toute question ou pour exercer vos droits, contactez notre Responsable désigné par la Loi 25 :
            </p>
            <p className="font-mono text-emerald-700 font-bold">privacy@forfeo.com</p>
            <p className="text-xs text-slate-500 mt-2">
              FORFEO INC.<br/>
              Québec, QC, Canada
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Privacy;

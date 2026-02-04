// frontend/src/pages/Resources.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';

const CATEGORY_OPTIONS = ['Tout', 'Approvisionnement', 'Restauration', 'Bureau', 'Logistique', 'Finances'];
const AUDIENCE_OPTIONS = ['Tout', 'Acheteurs', 'Fournisseurs'];

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [category, setCategory] = useState('Tout');
  const [audience, setAudience] = useState('Tout');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
        // On récupère UNIQUEMENT les contenus publiés
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setResources(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur chargement ressources:', err);
        setError(
          "Impossible de charger les contenus pour le moment. Veuillez réessayer plus tard."
        );
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Filtrage côté client (simple & efficace pour départ)
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const catOk = category === 'Tout' || item.category === category;
      const audOk =
        audience === 'Tout' ||
        item.audience === audience ||
        item.audience === 'Tous';

      const term = search.trim().toLowerCase();
      const searchOk =
        !term ||
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(term)) ||
        (item.tags && item.tags.toLowerCase().includes(term));

      return catOk && audOk && searchOk;
    });
  }, [resources, category, audience, search]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* HERO / INTRO */}
        <header className="mb-10">
          <span className="inline-flex items-center text-xs font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Ressources & Blog B2B
          </span>

          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Comprendre, optimiser et moderniser vos achats B2B.
          </h1>

          <p className="mt-3 text-slate-600 max-w-2xl text-sm sm:text-base">
            Cette section rassemble des guides, checklists et articles pratiques pour aider les entreprises
            québécoises à mieux gérer{' '}
            <span className="font-semibold text-slate-800">
              l&apos;approvisionnement, les relations fournisseurs
            </span>{' '}
            et la logistique. L’objectif : vous faire gagner du temps, réduire vos coûts et sécuriser vos décisions.
          </p>
        </header>

        {/* BARRE DE RECHERCHE + FILTRES */}
        <section className="mb-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Recherche */}
            <div className="w-full sm:w-1/2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
                placeholder="Rechercher un sujet (ex : logistique, coût, restaurant...)"
                aria-label="Rechercher dans les ressources"
              />
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {/* Catégorie */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                aria-label="Filtrer par catégorie"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    Catégorie : {cat}
                  </option>
                ))}
              </select>

              {/* Audience */}
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                aria-label="Filtrer par audience"
              >
                {AUDIENCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    Pour : {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* CONTENU PRINCIPAL */}
        <section className="grid lg:grid-cols-3 gap-6">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <article
                    key={i}
                    className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse"
                  >
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-1/2 mb-3" />
                    <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </article>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="bg-white rounded-2xl border border-red-100 p-6 text-center">
                <span className="text-3xl mb-2 block">⚠️</span>
                <p className="text-red-600 font-semibold mb-2">
                  Un problème est survenu.
                </p>
                <p className="text-slate-500 text-sm mb-4">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-emerald-600 transition"
                >
                  Recharger la page
                </button>
              </div>
            )}

            {!loading && !error && filteredResources.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <span className="text-3xl mb-2 block">📭</span>
                <p className="font-semibold text-slate-800 mb-1">
                  Aucun contenu trouvé pour ces critères.
                </p>
                <p className="text-slate-500 text-sm">
                  Modifiez les filtres ou la recherche pour découvrir d’autres ressources.
                </p>
              </div>
            )}

            {!loading && !error && filteredResources.length > 0 && (
              <div className="space-y-4">
                {filteredResources.map((item) => (
                  <article
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.category && (
                          <span className="text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        )}
                        {item.audience && (
                          <span className="text-[11px] font-semibold text-slate-500 px-2 py-1 rounded-full bg-slate-50">
                            {item.audience === 'Acheteurs'
                              ? 'Pour les acheteurs'
                              : item.audience === 'Fournisseurs'
                              ? 'Pour les fournisseurs'
                              : 'Pour tous'}
                          </span>
                        )}
                      </div>

                      {item.created_at && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(item.created_at).toLocaleDateString('fr-CA', {
                            year: 'numeric',
                            month: 'short',
                            day: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
                      {item.title}
                    </h2>

                    {item.excerpt && (
                      <p className="text-sm text-slate-600 mb-3">
                        {item.excerpt}
                      </p>
                    )}

                    {item.tags && (
                      <p className="text-[11px] text-slate-400 mb-3">
                        Mots-clés :{' '}
                        <span className="font-mono">
                          {item.tags}
                        </span>
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-slate-400">
                        Lecture estimée :{' '}
                        <span className="font-semibold">
                          {item.reading_time || '5 min'}
                        </span>
                      </span>

                      {/* CTA placeholder : futur détail /slug, non bloquant pour l’instant */}
                      <button
                        type="button"
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-600 hover:underline"
                      >
                        Lire l&apos;article (bientôt)
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Colonne droite : encadré marketing / navigation future */}
          <aside className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-5">
              <h3 className="text-lg font-extrabold mb-2">
                Une bibliothèque pensée pour les opérations B2B.
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed">
                Guides pratiques, checklists, modèles d&apos;emails fournisseurs,
                idées pour optimiser vos coûts, et retours d&apos;expérience du terrain.
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Au fur et à mesure, Forfeo Supply pourra ainsi se positionner comme un
                partenaire de référence pour l&apos;approvisionnement B2B au Québec,
                autant pour les acheteurs que pour les fournisseurs locaux.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h4 className="font-extrabold text-sm text-slate-900 mb-2">
                Idées de contenus à venir
              </h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li>• Comment structurer vos achats pour gagner 5h par semaine.</li>
                <li>• Modèle d&apos;email pour renégocier vos prix fournisseurs.</li>
                <li>• Centraliser vos commandes sans perdre la relation humaine.</li>
                <li>• Les indicateurs clés à suivre pour vos coûts d&apos;approvisionnement.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default Resources;

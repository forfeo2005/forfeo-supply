// frontend/src/pages/ResourceDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const ResourceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState(null);

  // ------------------------
  // 1) Chargement de l’article
  // ------------------------
  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (err) {
        console.error('Erreur chargement article:', err);
        setError("Impossible de charger cet article pour le moment.");
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  // ------------------------
  // 2) Articles connexes (même catégorie)
  // ------------------------
  useEffect(() => {
    if (!article || !article.id) return;

    const fetchRelated = async () => {
      try {
        setRelatedLoading(true);

        let query = supabase
          .from('resources')
          .select(
            'id, title, slug, category, excerpt, created_at, reading_time'
          )
          .eq('published', true)
          .neq('id', article.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (article.category) {
          query = query.eq('category', article.category);
        }

        const { data, error } = await query;
        if (error) throw error;

        setRelated(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur chargement articles connexes:', err);
        setRelated([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    fetchRelated();
  }, [article]);

  const formattedDate =
    article?.created_at
      ? new Date(article.created_at).toLocaleDateString('fr-CA', {
          year: 'numeric',
          month: 'long',
          day: '2-digit',
        })
      : null;

  // --- ÉTATS ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <div className="h-4 w-24 bg-slate-200 rounded-full mb-3 animate-pulse" />
            <div className="h-8 w-3/4 bg-slate-200 rounded mb-2 animate-pulse" />
            <div className="h-8 w-2/3 bg-slate-200 rounded mb-6 animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-slate-200 rounded w-full animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-11/12 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-10/12 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-9/12 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!loading && error && !article) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">
            Impossible d&apos;afficher cet article
          </h1>
          <p className="text-sm text-slate-500 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/resources')}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-emerald-600 transition"
          >
            Retour aux ressources
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-4xl mb-3">📭</p>
          <h1 className="text-xl font-extrabold text-slate-900 mb-2">
            Article introuvable
          </h1>
          <p className="text-sm text-slate-500 mb-4">
            Il se peut que ce contenu ait été retiré ou que le lien soit
            invalide.
          </p>
          <button
            type="button"
            onClick={() => navigate('/resources')}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-xl bg-slate-900 text-white hover:bg-emerald-600 transition"
          >
            Retour aux ressources
          </button>
        </div>
      </div>
    );
  }

  // --- RENDU ARTICLE ---

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Fil d'Ariane simple */}
        <nav className="text-xs text-slate-500 mb-4">
          <Link
            to="/"
            className="hover:underline hover:text-slate-700 font-semibold"
          >
            Accueil
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            to="/resources"
            className="hover:underline hover:text-slate-700 font-semibold"
          >
            Ressources
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-400">Article</span>
        </nav>

        {/* En-tête article */}
        <header className="mb-8 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {article.category && (
              <span className="text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                {article.category}
              </span>
            )}

            {article.audience && (
              <span className="text-[11px] font-semibold text-slate-500 px-2 py-1 rounded-full bg-slate-50">
                {article.audience === 'Acheteurs'
                  ? 'Pour les acheteurs'
                  : article.audience === 'Fournisseurs'
                  ? 'Pour les fournisseurs'
                  : 'Pour tous'}
              </span>
            )}

            {formattedDate && (
              <span className="text-[11px] text-slate-400 font-mono ml-auto">
                {formattedDate}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
              {article.excerpt}
            </p>
          )}

          {article.reading_time && (
            <p className="mt-2 text-[11px] text-slate-400">
              Lecture estimée :{' '}
              <span className="font-semibold">{article.reading_time}</span>
            </p>
          )}
        </header>

        {/* Corps + colonne droite Forfeo Supply */}
        <section className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Corps de l’article */}
          <article className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            {/* 
              On suppose que "content" est du texte brut ou du markdown simple.
              Pour l'instant, on l'affiche en texte brut avec retours à la ligne.
              Plus tard, on pourra brancher un renderer markdown si tu veux.
            */}
            {article.content ? (
              <div className="prose prose-sm sm:prose-base max-w-none text-slate-800 whitespace-pre-line">
                {article.content}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Le contenu détaillé de cet article sera bientôt disponible.
              </p>
            )}

            {/* Zone CTA bas d’article */}
            <div className="mt-8 border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {article.tags && (
                <p className="text-[11px] text-slate-400">
                  Mots-clés :{' '}
                  <span className="font-mono">{article.tags}</span>
                </p>
              )}

              <div className="flex gap-2 justify-start sm:justify-end">
                <Link
                  to="/resources"
                  className="text-xs sm:text-sm font-bold px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  ← Retour aux ressources
                </Link>
                <Link
                  to="/market"
                  className="text-xs sm:text-sm font-bold px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition"
                >
                  Voir le marché B2B
                </Link>
              </div>
            </div>
          </article>

          {/* Colonne droite : encadré Forfeo Supply / CTA */}
          <aside className="space-y-4">
            <div className="bg-emerald-900 text-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-extrabold mb-2">
                Forfeo Supply en pratique
              </h2>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Centralisez vos achats, comparez les prix de vos fournisseurs
                locaux et sécurisez vos approvisionnements grâce à une
                plateforme pensée pour les entreprises du Québec.
              </p>
              <ul className="mt-3 text-xs text-emerald-100 space-y-1">
                <li>• Vue marché en temps réel.</li>
                <li>• Commandes par fournisseur et conditions de paiement.</li>
                <li>• Historique de vos dépenses B2B.</li>
              </ul>
              <Link
                to="/merchant"
                className="mt-4 inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 transition"
              >
                Accéder à mon espace acheteur
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-4 text-sm text-slate-700">
              <h3 className="font-extrabold text-sm mb-2">
                Vous êtes fournisseur ?
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Rejoignez Forfeo Supply pour être visible auprès des acheteurs
                professionnels, sans perdre la relation humaine.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-3 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-emerald-600 transition"
              >
                Créer / connecter mon compte
              </Link>
            </div>
          </aside>
        </section>

        {/* Section articles connexes */}
        <section className="mt-10">
          <h2 className="text-sm font-extrabold text-slate-900 mb-3 uppercase tracking-wide">
            Articles connexes
          </h2>

          {relatedLoading && (
            <p className="text-xs text-slate-400">Chargement…</p>
          )}

          {!relatedLoading && related.length === 0 && (
            <p className="text-xs text-slate-400">
              D’autres ressources seront ajoutées prochainement.
            </p>
          )}

          {!relatedLoading && related.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/resources/${item.slug}`}
                  className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    {item.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    )}
                    {item.created_at && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(item.created_at).toLocaleDateString('fr-CA', {
                          year: '2-digit',
                          month: 'short',
                          day: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-xs text-slate-500 mb-2 line-clamp-3">
                      {item.excerpt}
                    </p>
                  )}
                  <span className="mt-auto text-[11px] text-emerald-700 font-semibold">
                    Lire l’article →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResourceDetail;

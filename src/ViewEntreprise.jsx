import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from './api/axios';


const ViewEntreprise = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entreprise, setEntreprise] = useState(null);
  const [mise, setMise] = useState(null);

  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => { fetchData();fetchmises() }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/entreprises/${id}`);
      setEntreprise(res.data.entreprise ?? res.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };
  const fetchmises = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/countmises/${id}`);
      setMise(res.data[0].total_mise);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString('fr-MA', {
      style: 'currency', currency: 'MAD', minimumFractionDigits: 2,
    });

  const Stars = ({ rating }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <i key={n} className={`fa-star text-sm ${n <= (rating ?? 0) ? 'fa-solid text-yellow-400' : 'fa-regular text-white/20'}`} />
      ))}
      {rating && <span className="ml-1 text-xs text-white/60">({rating}/5)</span>}
    </div>
  );

  // ── Loading ───────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="font-semibold">Chargement...</p>
      </div>
    </div>
  );

  // ── Error ─────────────────────────────────────────────
  if (error || !entreprise) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-triangle-exclamation text-red-500 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
        <p className="text-gray-500 mb-6 text-sm">{error || 'Entreprise introuvable'}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-all border-0 cursor-pointer">
          Retour
        </button>
      </div>
    </div>
  );

  const e = entreprise;
  const isActive = e.status === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-4 sm:p-6 lg:p-8">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* ── Back + Actions bar ───────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors border-0 bg-transparent cursor-pointer text-sm">
            <i className="fa-solid fa-arrow-left" />
            Retour
          </button>

          <div className="flex gap-2">
            <Link
              to={`/insc/${e.id}`}
              state={{ fromApp: true }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all"
            >
              <i className="fa-solid fa-clock-rotate-left" />
              Historique inscriptions
            </Link>
            
          </div>
        </div>

        {/* ── Hero card ────────────────────────────── */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 sm:p-8 mb-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Logo */}
            {e.logo ? (
              <img
                  src={`https://backend-production-36f5.up.railway.app/${e.logo}`} 
                alt={e.nom}
                className="w-28 h-28 rounded-2xl object-cover shadow-xl flex-shrink-0 border-2 border-white/20"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-700 flex items-center justify-center shadow-xl flex-shrink-0 border-2 border-white/20">
                <i className="fa-solid fa-building text-white text-5xl" />
              </div>
            )}

            {/* Main info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">{e.nom ?? '—'}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isActive
                    ? 'bg-green-400/20 border-green-400/40 text-green-300'
                    : 'bg-red-400/20 border-red-400/40 text-red-300'
                }`}>
                  <i className={`fa-solid fa-circle text-[8px] mr-1.5 ${isActive ? 'text-green-400' : 'text-red-400'}`} />
                  {isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {e.secteur && <p className="text-white/60 text-sm mb-3">{e.secteur}</p>}

              <Stars rating={e.rating} />

              {e.responsable && (
                <p className="text-white/75 text-sm mt-3 flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-user text-white/50 text-xs" />
                  </span>
                  {e.responsable}
                </p>
              )}
            </div>

            {/* Quick stats */}
            <div className="flex sm:flex-col gap-3 flex-shrink-0">
              <div className="bg-white/10 rounded-2xl px-5 py-3 text-center border border-white/15 min-w-[90px]">
                <p className="text-xl font-bold text-white">{mise?? 0}</p>
                <p className="text-xs text-white/50 mt-0.5">Missions</p>
              </div>
              
            </div>
          </div>
        </div>

        {/* ── Content grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Contact */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-500/30 flex items-center justify-center">
                <i className="fa-solid fa-address-book text-blue-300 text-sm" />
              </span>
              Coordonnées
            </h3>
            <div className="space-y-4">

              {e.location && (
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-location-dot text-white/60 text-sm" />
                  </span>
                  <div>
                    <p className="text-xs text-white/40 font-medium">Localisation</p>
                    <p className="text-sm text-white font-semibold">{e.location}</p>
                  </div>
                </div>
              )}

              {e.email && (
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-envelope text-white/60 text-sm" />
                  </span>
                  <div>
                    <p className="text-xs text-white/40 font-medium">Email</p>
                    <p className="text-sm text-blue-300 font-semibold hover:text-blue-200 transition-colors break-all">
                      {e.email}
                    </p>
                  </div>
                </div>
              )}

              {e.phone1 && (
                <a href={`tel:${e.phone1}`} className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-phone text-white/60 text-sm" />
                  </span>
                  <div>
                    <p className="text-xs text-white/40 font-medium">Téléphone principal</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white font-semibold hover:text-white/80 transition-colors">{e.phone1}</p>
                    </div>
                  </div>
                </a>
              )}

              {e.phone2 && (
                <a href={`tel:${e.phone2}`} className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-phone text-white/60 text-sm" />
                  </span>
                  <div>
                    <p className="text-xs text-white/40 font-medium">Téléphone secondaire</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white font-semibold hover:text-white/80 transition-colors">
                        {e.phone2}
                      </p>
                      
                    </div>
                  </div>
                </a>
              )}

              {!e.location && !e.email && !e.phone1 && !e.phone2 && (
                <p className="text-white/30 text-sm text-center py-4">Aucune coordonnée renseignée</p>
              )}
            </div>
          </div>

          {/* Abonnement */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-yellow-500/30 flex items-center justify-center">
                <i className="fa-solid fa-star text-yellow-300 text-sm" />
              </span>
              Abonnement
            </h3>

            {e.abonnement_id ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/15">
                  <div>
                    <p className="text-xs text-white/40 font-medium mb-1">Type</p>
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-purple-400/30 border border-purple-400/40 text-purple-200">
                      {e.abonnement_type ?? '—'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 font-medium mb-1">Prix</p>
                    <p className="text-lg font-bold text-emerald-300">{formatPrice(e.abonnement_price)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-white/40 font-medium mb-1">ID Abonnement</p>
                    <p className="text-sm font-bold text-white/80">#{e.abonnement_id}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-white/40 font-medium mb-1">Souscrit le</p>
                    <p className="text-sm font-semibold text-white/80">{formatDate(e.abonnement_created_at)}</p>
                  </div>
                </div>

                {e.contrat && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
  <i className="fa-solid fa-file-contract text-white/40 text-lg" />
  <div className="flex-1 min-w-0">
    <p className="text-xs text-white/40 font-medium mb-2">Contrat</p>
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          window.open(`https://backend-production-36f5.up.railway.app/${e.contrat}`, '_blank');
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 text-xs font-semibold rounded-lg border border-blue-500/30 transition-all"
      >
        <i className="fa-solid fa-eye text-xs" />
        Voir
      </button>

      <button
        onClick={async () => {
          const url = `https://backend-production-36f5.up.railway.app/${e.contrat}`;
          const response = await fetch(url);
          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = e.contrat.split('/').pop();
          link.click();
          URL.revokeObjectURL(link.href);
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 text-xs font-semibold rounded-lg border border-green-500/30 transition-all"
      >
        <i className="fa-solid fa-download text-xs" />
        Télécharger
      </button>
    </div>
  </div>
</div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-white/30">
                <i className="fa-solid fa-ban text-3xl block mb-2" />
                <p className="text-sm">Aucun abonnement actif</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                <i className="fa-solid fa-circle-info text-emerald-300 text-sm" />
              </span>
              Informations
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Secteur d\'activité', value: e.secteur, icon: 'fa-industry' },
                { label: 'Responsable',          value: e.responsable, icon: 'fa-user-tie' },
                { label: 'Type abonnement',      value: e.type_abonnement, icon: 'fa-tag' },
                { label: 'Mise',                 value: e.mise ? formatPrice(e.mise) : null, icon: 'fa-coins' },
                { label: 'Total missions',       value: e.total_missions, icon: 'fa-briefcase' },
                { label: 'Note',                 value: e.rating ? `${e.rating} / 5` : null, icon: 'fa-star' },
              ].map(({ label, value, icon }) => value != null && (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/10 last:border-0">
                  <span className="text-xs text-white/45 flex items-center gap-2">
                    <i className={`fa-solid ${icon} w-3`} />
                    {label}
                  </span>
                  <span className="text-sm font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gray-500/30 flex items-center justify-center">
                <i className="fa-solid fa-clock-rotate-left text-gray-300 text-sm" />
              </span>
              Historique
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-plus text-green-400 text-xs" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Entreprise créée</p>
                  <p className="text-xs text-white/45 mt-0.5">{formatDate(e.created_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-pen text-blue-400 text-xs" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Dernière modification</p>
                  <p className="text-xs text-white/45 mt-0.5">{formatDate(e.updated_at)}</p>
                </div>
              </div>
              {e.abonnement_updated_at && (
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-star text-yellow-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Abonnement mis à jour</p>
                    <p className="text-xs text-white/45 mt-0.5">{formatDate(e.abonnement_updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewEntreprise;
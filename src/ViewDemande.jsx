import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from './api/axios';

const ViewDemande = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // ✅ was missing

  useEffect(() => {
    fetchDemandeDetails();
  }, [id]);

  const fetchDemandeDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/demande/${id}`);
      setDemande(response.data.demande);
    } catch (err) {
      console.error('Error fetching demande:', err);
      setError('Impossible de charger les détails de la demande');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed: uses fetchDemandeDetails() not fetchDemandes(), no missing setShowPopup
  const handleTraiter = async (demandeId) => {
    if (!window.confirm('Marquer cette demande comme traitée ?')) return;
    setActionLoading('traiter');
    try {
      await api.put(`/status/${demandeId}`, { status: 'Traité' });
      await fetchDemandeDetails();
    } catch (error) {
      console.error('Error updating demande:', error);
      alert('❌ Erreur lors de la mise à jour du statut.');
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Fixed: same as above
  const handleRefuser = async (demandeId) => {
    if (!window.confirm('Refuser cette demande ?')) return;
    setActionLoading('refuser');
    try {
      await api.put(`/status/${demandeId}`, { status: 'Refusé' });
      await fetchDemandeDetails();
    } catch (error) {
      console.error('Error updating demande:', error);
      alert('❌ Erreur lors de la mise à jour du statut.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-exclamation-triangle text-red-500 text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error || 'Demande introuvable'}</p>
          <Link to="/demandes" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-all">
            Retour aux demandes
          </Link>
        </div>
      </div>
    );
  }

  const d = demande[0]; // ✅ alias to avoid repeating demande[0] everywhere

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-4 sm:p-6 lg:p-8">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <button onClick={() => navigate('/demandes')} className="flex items-center gap-2 text-white hover:text-purple-200 transition-colors mb-4">
          <i className="fa-solid fa-arrow-left"></i>
          <span className="font-medium">Retour aux demandes</span>
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Détails de la demande</h1>

          {/* ✅ Status badge or action buttons */}
          {d.status == 'Traité' ? (
            <span className="px-4 py-2 rounded-full text-white font-semibold text-sm bg-green-500 flex items-center gap-2">
              <i className="fa-solid fa-circle-check"></i>
              {d.status}
            </span>
          ) : d.status == 'Refusé' ? (
            <span className="px-4 py-2 rounded-full text-white font-semibold text-sm bg-red-500 flex items-center gap-2">
              <i className="fa-solid fa-circle-xmark"></i>
              {d.status}
            </span>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleTraiter(d.id)}
                disabled={actionLoading !== null}
                className="px-5 py-3 bg-[#00d47e] text-white rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#00a861] hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {actionLoading === 'traiter'
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Traitement...</>
                  : <><i className="fa-solid fa-check"></i> Traiter</>
                }
              </button>
              <button
                onClick={() => handleRefuser(d.id)}
                disabled={actionLoading !== null}
                className="px-5 py-3 bg-[#ff4757] text-white rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#d63447] hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {actionLoading === 'refuser'
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Refus...</>
                  : <><i className="fa-solid fa-xmark"></i> Refuser</>
                }
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Company Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl sticky top-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {d.nom?.substring(0, 2).toUpperCase() || 'N/A'}
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{d.nom}</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-industry text-purple-600"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Secteur</p>
                    <p className="text-sm text-gray-800 font-semibold">{d.secteur || 'Non spécifié'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-location-dot text-purple-600"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium">Localisation</p>
                    <p className="text-sm text-gray-800 font-semibold">{d.location || 'Non spécifié'}</p>
                  </div>
                </div>
                {d.phone1 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-phone text-purple-600"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Téléphone</p>
                      <p className="text-sm text-gray-800 font-semibold">{d.phone1}</p>
                      {d.phone2 && <p className="text-sm text-gray-600">{d.phone2}</p>}
                    </div>
                  </div>
                )}
                {d.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-envelope text-purple-600"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm text-gray-800 font-semibold break-all">{d.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Job Information */}
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-briefcase text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Informations du poste</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium mb-1">Poste</p>
                  <p className="text-lg text-gray-800 font-bold">{d.poste}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium mb-1">Type de contrat</p>
                  <p className="text-lg text-gray-800 font-bold">{d.contrat}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium mb-1">Nombre de postes</p>
                  <p className="text-lg text-gray-800 font-bold">{d.NumPostes}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium mb-1">Salaire</p>
                  <p className="text-lg text-gray-800 font-bold">{d.min} - {d.max} DH</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500 font-medium mb-3">Compétences requises</p>
                <div className="flex flex-wrap gap-2">
                  {d.competence?.split(',').map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
              {d.description && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 font-medium mb-2">Description</p>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl">{d.description}</p>
                </div>
              )}
            </div>

            {/* Interview Information */}
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-calendar-check text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Détails de l'entretien</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-calendar text-blue-600"></i>
                    <p className="text-xs text-gray-500 font-medium">Date d'entretien</p>
                  </div>
                  <p className="text-lg text-gray-800 font-bold">{formatDate(d.dateEntretien)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fa-solid fa-map-marker-alt text-blue-600"></i>
                    <p className="text-xs text-gray-500 font-medium">Lieu</p>
                  </div>
                  <p className="text-lg text-gray-800 font-bold">{d.localEntretien}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-clock-rotate-left text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Historique</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-plus text-green-600"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Demande créée</p>
                    <p className="text-xs text-gray-500">{formatDateTime(d.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-pen text-blue-600"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">Dernière modification</p>
                    <p className="text-xs text-gray-500">{formatDateTime(d.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>
    </div>
  );
};

export default ViewDemande;
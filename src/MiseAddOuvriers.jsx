import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from './api/axios';

const MiseAddOuvriers = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchName, setSearchName] = useState('');
  const [searchSpecialite, setSearchSpecialite] = useState('');
  const [ouvriers, setOuvriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState({});
  const [popup, setPopup] = useState({ show: false, msg: '', type: 'success' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const showPopup = (msg, type = 'success') => {
    setPopup({ show: true, msg, type });
    setTimeout(() => setPopup(p => ({ ...p, show: false })), 3500);
  };

  useEffect(() => {
    fetchOuvriers();
    fetchTotalMises()
  }, []);

  const fetchOuvriers = () => {
    setLoading(true);
    api.get('/ouvriers')
      .then(res => { setOuvriers(res.data); })
      .catch(err => { console.error('Error fetching ouvriers:', err); })
      .finally(() => { setLoading(false); });
  };

  const fetchTotalMises = () => {
    api.get(`/mises/count/${id}`)
      .then(res => { setTotal(res.data); })
      .catch(err => { console.error('Error fetching total:', err); });
  };

  const handleAddOuvrier = async (ouvrier) => {
    // ✅ Check if quota is full
    if (total.totalMises >= total.NumPostes) {
      showPopup(`⚠️ Quota atteint : ${total.totalMises}/${total.NumPostes} postes déjà remplis.`, 'warning');
      return;
    }

    try {
      await api.post('/mise', { ouvrierID: ouvrier.id, demandeID: id });
      showPopup(`✅ ${ouvrier.nom_complet} a été ajouté avec succès !`, 'success');
      fetchOuvriers();
      fetchTotalMises(); // Refresh count after adding
    } catch (error) {
      console.error('Error adding ouvrier:', error);
      if (error.response?.status === 400) {
        showPopup(`⚠️ ${ouvrier.nom_complet} est déjà assigné à cette demande.`, 'warning');
      } else {
        showPopup(`❌ Erreur lors de l'ajout de l'ouvrier.`, 'error');
      }
    }
  };

  const handleViewDetails = (ouvrierID) => {
    navigate(`/ouvriers/${ouvrierID}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'disponible':   return 'bg-[#00d47e]/20 text-[#00ff9a] border-[#00d47e]';
      case 'en mission':   return 'bg-blue-500/20 text-blue-300 border-blue-500';
      case 'indisponible': return 'bg-[#ff4757]/20 text-[#ff7b87] border-[#ff4757]';
      default:             return 'bg-gray-500/20 text-gray-300 border-gray-500';
    }
  };

  const getRankingStars = (ranking) =>
    [0,1,2,3,4].map(i => (
      <i key={i} className={`fa-solid fa-star text-sm ${i < ranking ? 'text-yellow-400' : 'text-gray-400'}`} />
    ));

  const filteredOuvriers = ouvriers.filter(ouvrier => {
    const nameMatch = ouvrier.nom_complet?.toLowerCase().includes(searchName.toLowerCase());
    const specialiteMatch = !searchSpecialite || ouvrier.specialite?.toLowerCase().includes(searchSpecialite.toLowerCase());
    return nameMatch && specialiteMatch;
  });

  // Check if quota is full
  const isQuotaFull = total.totalMises >= total.NumPostes;

  const totalPages = Math.ceil(filteredOuvriers.length / ITEMS_PER_PAGE);
    const paginatedOuvriers = filteredOuvriers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
    useEffect(() => { setCurrentPage(1); }, [searchName, searchSpecialite]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-purple-600 to-purple-700 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white min-h-screen bg-gradient-to-t from-purple-600 to-purple-700 p-3">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* ── Toast popup ───────────────────────────────── */}
      <div className={`fixed top-6 right-6 z-[200] transition-all duration-500 ${popup.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl font-semibold text-sm border backdrop-blur-md ${
          popup.type === 'error'
            ? 'bg-red-500/20 border-red-400/40 text-white'
            : popup.type === 'warning'
            ? 'bg-yellow-500/20 border-yellow-400/40 text-white'
            : 'bg-green-500/20 border-green-400/40 text-white'
        }`}>
          {popup.msg}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 animate-fadeInDown">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Gestion des Ouvriers
          </h1>
          <p className="text-white/90 text-sm">
            Liste complète des ouvriers disponibles
            {total.NumPostes && (
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${
                isQuotaFull ? 'bg-red-500/30 border border-red-400' : 'bg-green-500/30 border border-green-400'
              }`}>
                {total.totalMises || 0} / {total.NumPostes} postes remplis
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <Link
            to="/"
            className="px-6 py-3 bg-white/15 backdrop-blur-md rounded-2xl flex items-center gap-2 border-2 border-transparent hover:bg-white/25 hover:border-white/30 transition-all font-semibold text-sm"
          >
            <i className="fa-solid fa-house" />
            Accueil
          </Link>
          <Link
            to={`/mise-en-place-ouvriers/${id}`}
            className="px-6 py-3 bg-white/15 backdrop-blur-md rounded-2xl flex items-center gap-2 border-2 border-transparent hover:bg-white/25 hover:border-white/30 transition-all font-semibold text-sm"
          >
            <i className="fa-solid fa-users" />
            Ouvriers
          </Link>
          <Link
            to={`/réunions/${id}`}
            className="px-6 py-3 bg-white/15 backdrop-blur-md rounded-2xl flex items-center gap-2 border-2 border-transparent hover:bg-white/25 hover:border-white/30 transition-all font-semibold text-sm"
          >
            <i className="fa-solid fa-file-lines" />
            Demande
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white/15 backdrop-blur-md rounded-2xl flex items-center gap-2 border-2 border-transparent hover:bg-white/25 hover:border-white/30 transition-all font-semibold text-sm"
          >
            <i className="fa-solid fa-arrow-left" />
            Retour
          </button>
        </div>
      </div>

      {/* Quota Warning Banner */}
      {isQuotaFull && (
        <div className="mb-4 p-4 bg-red-500/20 border-2 border-red-400/40 rounded-2xl backdrop-blur-md animate-fadeInDown">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-exclamation-triangle text-red-400 text-2xl" />
            <div>
              <h3 className="font-bold text-lg">Quota de postes atteint</h3>
              <p className="text-sm text-white/80">
                Tous les {total.NumPostes} postes ont été remplis. Vous ne pouvez plus ajouter d'ouvriers à cette demande.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white/10 backdrop-blur-xl p-4 rounded-3xl mb-5 border-2 border-white/10">
        <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border-2 border-transparent focus-within:bg-white/20 focus-within:border-white/30 transition-all md:w-[350px]">
          <i className="fa-solid fa-magnifying-glass text-white/70" />
          <input
            type="text"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder="Rechercher par nom..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder-white/70"
          />
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border-2 border-transparent focus-within:bg-white/20 focus-within:border-white/30 transition-all md:w-[350px]">
          <i className="fa-solid fa-toolbox text-white/70" />
          <input
            type="text"
            value={searchSpecialite}
            onChange={e => setSearchSpecialite(e.target.value)}
            placeholder="Rechercher par spécialité..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder-white/70"
          />
        </div>

        {(searchName || searchSpecialite) && (
          <button
            onClick={() => { setSearchName(''); setSearchSpecialite(''); }}
            className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 hover:bg-white/20 transition-all text-sm font-semibold"
          >
            <i className="fa-solid fa-times mr-2" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-[30px] p-3 border-2 border-white/10 animate-fadeInUp overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b-2 border-white/20">
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Nom Complet</th>
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Localisation</th>
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Spécialité</th>
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Ranking</th>
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Statut</th>
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOuvriers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-white/70">
                  <i className="fa-solid fa-users text-4xl mb-4 opacity-50 block" />
                  <p>Aucun ouvrier trouvé</p>
                </td>
              </tr>
            ) : (
              paginatedOuvriers.map(ouvrier => (
                <tr key={ouvrier.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4"><strong>{ouvrier.nom_complet}</strong></td>
                  <td className="p-4">{ouvrier.localisation || 'N/A'}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-purple-500/30 rounded-full text-xs font-semibold">
                      {ouvrier.specialite || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">{getRankingStars(ouvrier.ranking || 0)}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(ouvrier.status)}`}>
                      {ouvrier.status || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddOuvrier(ouvrier)}
                        disabled={isQuotaFull}
                        className={`px-4 py-2 rounded-xl font-semibold text-xs transition-all flex items-center gap-2 ${
                          isQuotaFull
                            ? 'bg-gray-500/50 cursor-not-allowed opacity-50'
                            : 'bg-green-500 hover:bg-green-600 hover:-translate-y-1 hover:shadow-lg'
                        }`}
                        title={isQuotaFull ? 'Quota atteint' : 'Ajouter à la demande'}
                      >
                        <i className="fa-solid fa-plus" />
                      </button>
                      <button
                        onClick={() => handleViewDetails(ouvrier.id)}
                        className="px-4 py-2 bg-white/10 border-2 border-white/20 rounded-xl font-semibold text-xs hover:bg-white/20 transition-all flex items-center gap-2"
                        title="Voir les détails"
                      >
                        <i className="fa-solid fa-eye" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all border border-white/20"
          >
            <i className="fa-solid fa-chevron-left text-sm" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 rounded-full text-sm font-semibold transition-all border ${
                page === currentPage
                  ? 'bg-white text-purple-700 border-white shadow-lg'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all border border-white/20"
          >
            <i className="fa-solid fa-chevron-right text-sm" />
          </button>
        </div>
      )}
      {filteredOuvriers.length > 0 && (
        <p className="text-center text-white/40 text-xs mt-3">
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredOuvriers.length)} sur {filteredOuvriers.length} ouvrier{filteredOuvriers.length !== 1 ? 's' : ''}
        </p>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-30px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeInUp   { from { opacity:0; transform:translateY(40px)  } to { opacity:1; transform:translateY(0) } }
        .animate-fadeInDown { animation: fadeInDown 0.8s ease; }
        .animate-fadeInUp   { animation: fadeInUp   1s   ease; }`
        }</style>
    </div>
  );
};

export default MiseAddOuvriers;
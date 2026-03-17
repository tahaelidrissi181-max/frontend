import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api/axios';
import SidePopup from './SidePopup';
import EditReunion from './EditReunion';
import { useStateContext } from './Context/contextproviders';
import { useLocation, useNavigate } from 'react-router-dom'

const EntrepriseReunion = () => {
  const [searchSpeciality, setSearchSpeciality] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [demandesData, setDemandesData] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const { user } = useStateContext();
  const location = useLocation()
  const navigate = useNavigate()

useEffect(() => {
  if (!location.state?.fromApp) {
    navigate('/', { replace: true })
  }
}, [])

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = () => {
    api.get(`/reunions/${user[0].entrepriseID}`)
      .then(res => {
        setDemandesData(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const filteredDemandes = demandesData.filter(demande => {
    const specialityMatch = demande.poste.toLowerCase().includes(searchSpeciality.toLowerCase());
    const statusMatch = statusFilter === 'all' || demande.reunion === statusFilter;
    return  specialityMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredDemandes.length / ITEMS_PER_PAGE);
    const paginatedDemandes = filteredDemandes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => { setCurrentPage(1); }, [searchSpeciality, statusFilter]);

  function handleUpdate(e){
    setSelectedDemande(e)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette REUNION ?")) {
      return false
}
  try {
    await api.delete(`/demandes/${id}`);
    fetchDemandes();
    setShowPopup(true);
    setMessage("✅ La demande a été supprimée avec succès !");
  } catch (error) {
    console.error('Error updating demande:', error);
    alert("❌ Erreur lors de la mise à jour du statut.");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-t from-purple-600 to-purple-700  text-white p-4 sm:p-6 lg:p-8">
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 pr-0 sm:pr-32">
        <h1 className="text-xl sm:text-2xl font-semibold">Espace Réunions !</h1>
        <Link 
          to="/"
          className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/25 text-white font-medium flex items-center gap-2 transition-all hover:bg-white/30 text-xs sm:text-sm"
        >
          <i className="fa-solid fa-house"></i>
          <span>Retour à l'accueil</span>
        </Link>
      </div>

      {/* Search Section */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0 bg-[rgba(108,148,223,0.5)] backdrop-blur-md px-5 py-3 rounded-full flex items-center gap-3 border border-white/20">
          <i className="fa-solid fa-magnifying-glass text-white"></i>
          <input
            type="text"
            value={searchSpeciality}
            onChange={(e) => setSearchSpeciality(e.target.value)}
            placeholder="Recherche par spécialité"
            className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm placeholder-white/70"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[rgba(108,148,223,0.5)] backdrop-blur-md px-5 py-3 rounded-full border border-white/20 text-white text-xs sm:text-sm outline-none cursor-pointer min-w-[150px]"
        >
          <option value="all" className="bg-purple-700">Tous</option>
          <option value="attent" className="bg-purple-700">En attente</option>
          <option value="Traité" className="bg-purple-700">Traité</option>
          <option value="Refusé" className="bg-purple-700">Refusé</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-fadeInUp">
        {filteredDemandes && filteredDemandes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/70 text-sm sm:text-base">
            <i className="fa-solid fa-search text-4xl mb-4 opacity-50"></i>
            <p>Aucune demande trouvée</p>
          </div>
        ) : (
          paginatedDemandes.map((demande, index) => (
  <div
    key={demande.id}
    className="bg-gradient-to-br from-[rgba(108,148,223,0.4)] to-[rgba(88,118,183,0.4)] backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative transition-all duration-400 border-2 border-white/20 shadow-xl hover:-translate-y-2 hover:shadow-2xl"
  >
    {/* Action buttons - top right row */}
    <div className="absolute top-4 right-4 flex gap-2">
      <button
        onClick={() => handleUpdate(demande)}
        className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-500/60 border border-purple-400/40 flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(147,51,234,0.4)]"
        title="Modifier"
      >
        <i className="fa-solid fa-pen text-white text-xs"></i>
      </button>
      <button
        onClick={() => handleDelete(demande.id)}
        className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-500/60 border border-red-400/40 flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(239,68,68,0.4)]"
        title="Supprimer"
      >
        <i className="fa-solid fa-trash text-white text-xs"></i>
      </button>
      <Link
        to={`/réunions/${demande.id}`}
        className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-500/60 border border-blue-400/40 flex items-center justify-center transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)]"
        title="Voir"
        state={{ fromApp: true }}
      >
        <i className="fa-solid fa-eye text-white text-xs"></i>
      </Link>
    </div>

    {/* Content */}
    <div className="text-center mb-5 mt-8">
      <div className="text-xs sm:text-sm leading-relaxed space-y-1.5">
        <div className="flex gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <strong className="min-w-[140px] opacity-90">Poste :</strong>
          <span>{demande.poste}</span>
        </div>
        <div className="flex gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <strong className="min-w-[140px] opacity-90">Compétences :</strong>
          <span>{demande.competence}</span>
        </div>
        <div className="flex gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <strong className="min-w-[140px] opacity-90">Nb postes :</strong>
          <span>{demande.NumPostes} poste(s)</span>
        </div>
        <div className="flex gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <strong className="min-w-[140px] opacity-90">Salaire :</strong>
          <span>{demande.min}-{demande.max} DH</span>
        </div>
        <div className="flex gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <strong className="min-w-[140px] opacity-90">Contrat :</strong>
          <span>{demande.contrat}</span>
        </div>
        <div className="flex gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <strong className="min-w-[140px] opacity-90">Description :</strong>
          <span>
            {demande.description?.slice(0, 10)}
            {demande.description?.length > 10 && "..."}
          </span>
        </div>
        <div className="flex gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <strong className="min-w-[140px] opacity-90">Date entretien :</strong>
          <span>{new Date(demande.dateEntretien).toISOString().split("T")[0]}</span>
        </div>
        <div className="flex gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <strong className="min-w-[140px] opacity-90">Lieu :</strong>
          <span>{demande.localEntretien}</span>
        </div>
      </div>
    </div>

    {/* Status badge */}
    {demande.reunion === "attent" ? (
      <div className="mt-4 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/40 rounded-full text-center">
        <div className="flex items-center justify-center gap-2 text-yellow-400 font-semibold text-sm">
          <i className="fa-solid fa-clock"></i>
          <span>Demande En attent</span>
        </div>
      </div>
    ) : demande.reunion == "Traité" ? (
      <div className="mt-4 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/40 rounded-full text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold text-sm">
          <i className="fa-solid fa-circle-check"></i>
          <span>Demande traitée</span>
        </div>
      </div>
    ) : demande.reunion === "Refusé" ? (
      <div className="mt-4 px-4 py-2.5 bg-red-500/10 border border-red-500/40 rounded-full text-center">
        <div className="flex items-center justify-center gap-2 text-red-400 font-semibold text-sm">
          <i className="fa-solid fa-circle-xmark"></i>
          <span>Demande refusée</span>
        </div>
      </div>
    ) : null}
            </div>
          ))
        )}
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
      {filteredDemandes.length > 0 && (
        <p className="text-center text-white/40 text-xs mt-3">
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredDemandes.length)} sur {filteredDemandes.length} Réunions
        </p>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease;
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
          }
          50% { 
            opacity: 0.5; 
          }
        }
      `}</style>
            <SidePopup
              message={message}
              type="success"
              show={showPopup}
              onClose={() => setShowPopup(false)}
            />

              <EditReunion
              demande={selectedDemande}
  isOpen={selectedDemande !== null}
  onClose={() => setSelectedDemande(null)}
  onUpdate={() => {
    setSelectedDemande(null)
    fetchDemandes()
    setShowPopup(true)
    setMessage('✅ La demande a été mise à jour avec succès !')
  }}
/>
    </div>
  );
};

export default EntrepriseReunion;
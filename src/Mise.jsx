import { useState ,useEffect} from 'react';
import { Link } from 'react-router-dom';
import api from './api/axios';

const MiseEnPlace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchAssignments();
  }, []);
  
  const fetchAssignments = () => {
    api.get('/mise')
      .then(res => setAssignments(res.data))
      .catch(err => console.error(err));
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE);
  const paginatedAssignments = filteredAssignments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ✅ Fixed: use searchQuery (primitive) not filteredAssignments (new array ref every render)
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  return (
    <div className="text-white min-h-screen bg-gradient-to-t from-purple-600 to-purple-700 p-3">
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 animate-fadeInDown">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Mise en Place Logistique
          </h1>
          <p className="text-white/90 text-sm">
            Affectation des effectifs par entreprise et chantier
          </p>
        </div>
        <Link
          to="/"
          className="mt-4 md:mt-0 px-8 py-3.5 bg-white/15 backdrop-blur-md rounded-2xl flex items-center gap-3 border-2 border-transparent hover:bg-white/25 hover:border-white/30 transition-all font-semibold"
        >
          <i className="fa-solid fa-house"></i>
          Accueil
        </Link>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white/10 backdrop-blur-xl p-4 rounded-3xl mb-5 border-2 border-white/10">
        <div className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl border-2 border-transparent focus-within:bg-white/20 focus-within:border-white/30 transition-all md:w-[400px]">
          <i className="fa-solid fa-magnifying-glass text-white/70"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Chercher une entreprise ou un ouvrier..."
            className="bg-transparent border-none outline-none w-full text-sm placeholder-white/70"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-[30px] p-3 border-2 border-white/10 animate-fadeInUp overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-white/20">
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Entreprise</th>
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Chantier / Mission</th>
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Total Ouvriers</th>
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Mise en Place</th>
              <th className="text-left p-4 font-semibold text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAssignments.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-12 text-white/50">
                  <i className="fa-solid fa-search text-3xl mb-3 block opacity-50" />
                  Aucun résultat trouvé
                </td>
              </tr>
            ) : (
              paginatedAssignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4"><strong>{assignment.nom}</strong></td>
                  <td className="p-4">
                    <i className="fa-solid fa-location-dot text-[#00d47e] mr-2"></i>{assignment.poste}
                  </td>
                  <td className="p-4">{assignment.NumPostes} Postes</td>
                  <td className="p-4 font-bold text-[#00ff9a]">
                    {assignment.totalMises} / {assignment.NumPostes}
                  </td>
                  <td className="p-4">
                    <Link
                      to={`/mise-en-place-ajouter/${assignment.id}`}
                      className="px-5 py-2.5 bg-white/10 border-2 border-white/20 rounded-xl font-semibold text-xs hover:bg-white/20 transition-all mr-2"
                    >
                      Détails
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
      {filteredAssignments.length > 0 && (
        <p className="text-center text-white/40 text-xs mt-3">
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredAssignments.length)} sur {filteredAssignments.length} missions
        </p>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-30px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
        .animate-fadeInDown { animation: fadeInDown 0.8s ease; }
        .animate-fadeInUp { animation: fadeInUp 1s ease; }
      `}</style>
    </div>
  );
};

export default MiseEnPlace;
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from './api/axios';

const isExpiredFn = (month, year) => {
  if (!month || !year) return true;
  const now = new Date();
  return new Date(year, month - 1) < new Date(now.getFullYear(), now.getMonth());
};

/* ── Card ─────────────────────────────────────────────── */
const InscriptionCard = ({ inscription, index }) => {
  const inscExpired = isExpiredFn(inscription.month, inscription.year);
  const isActive    = inscription.status === 'active';

  return (
    <div
      style={{ animationDelay: `${index * 60}ms` }}
      className="card-enter relative rounded-[28px] overflow-hidden border border-white/20 shadow-xl bg-white/10 backdrop-blur-md flex flex-col"
    >

      <div className="p-6 relative flex flex-col flex-1">

        {/* Logo + inscription expiry badge */}
        <div className="flex items-start justify-between mb-4">
          {inscription.logo ? (
            <img
              src={`https://backend-production-36f5.up.railway.app/${inscription.logo}`}
              alt={inscription.nom}
              className="w-14 h-14 rounded-2xl object-cover shadow-lg border border-white/10 flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 flex-shrink-0 bg-white/20">
              <i className="fa-solid fa-building text-white text-xl" />
            </div>
          )}

          {/* Inscription expiry badge (month/year based) */}
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            inscExpired
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${inscExpired ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`} />
            {inscription.month && inscription.year ? `${inscription.month}/${inscription.year} · ` : ''}
            {inscExpired ? 'Expiré' : 'Actif'}
          </span>
        </div>

        {/* Company name + sector */}
        <h3 className="text-white font-bold text-lg leading-tight mb-0.5 truncate">{inscription.nom ?? '—'}</h3>
        {inscription.secteur && (
          <p className="text-white/35 text-xs mb-3 truncate">{inscription.secteur}</p>
        )}

        {/* Entreprise status badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
            isActive
              ? 'bg-green-500/10 border-green-500/25 text-green-400'
              : 'bg-orange-500/10 border-orange-500/25 text-orange-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-green-400' : 'bg-orange-400'}`} />
            Entreprise {isActive ? 'active' : 'inactive'}
          </span>
        </div>

        {/* Responsable */}
        {inscription.responsable && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-user text-white/40 text-[9px]" />
            </div>
            <span className="text-white/45 text-xs truncate">{inscription.responsable}</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Divider */}
        <div className="border-t border-white/5 mt-3 mb-4" />

        {/* Actions row */}
        <div className="flex items-center justify-between gap-2">
          {/* Phone + WhatsApp */}
          <div className="flex gap-2">
            {inscription.phone1 && (
              <a
                href={`tel:${inscription.phone1}`}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/40 flex items-center justify-center transition-all duration-300"
                title={inscription.phone1}
              >
                <i className="fa-solid fa-phone text-white/40 text-xs" />
              </a>
            )}
            {inscription.phone1 && (
              <button
                onClick={() => window.open(`https://wa.me/${inscription.phone1?.replace(/\D/g, '')}`, '_blank')}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-500/40 flex items-center justify-center transition-all duration-300 cursor-pointer border-0"
              >
                <i className="fa-brands fa-whatsapp text-white/40 text-xs" />
              </button>
            )}
          </div>

          {/* Historique button — replaces eye icon */}
          <Link
            to={`/insc/${inscription.entid}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-300"
          >
            <i className="fa-solid fa-clock-rotate-left text-[10px]" />
            Historique
          </Link>
        </div>
      </div>
    </div>
  );
};

/* ── Filter pill ──────────────────────────────────────── */
const FilterPill = ({ label, count, active, variant, onClick }) => {
  const styles = {
    all:     active ? 'bg-white text-[#07040f] border-white shadow-white/20 shadow-lg'                     : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20 hover:text-white',
    active:  active ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30 shadow-lg'        : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20 hover:text-white',
    expired: active ? 'bg-red-500 text-white border-red-400 shadow-red-500/30 shadow-lg'                    : 'bg-white/10 text-white/60 border-white/20 hover:bg-white/20 hover:text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border cursor-pointer ${styles[variant]}`}
    >
      {label}
      <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-black/15 text-inherit' : 'bg-white/8 text-white/30'}`}>
        {count}
      </span>
    </button>
  );
};

/* ── Main page ────────────────────────────────────────── */
const Inscriptions = () => {
  const [inscs, setInscs]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [searchCompany, setSearchCompany] = useState('');
  const [searchYear, setSearchYear]       = useState('');
  const [filter, setFilter]               = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  useEffect(() => { fetchInscs(); }, []);

  const fetchInscs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/insc');
      setInscs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => ({
    all:     inscs.length,
    active:  inscs.filter(ins => !isExpiredFn(ins.month, ins.year)).length,
    expired: inscs.filter(ins =>  isExpiredFn(ins.month, ins.year)).length,
  }), [inscs]);

  const filtered = useMemo(() => inscs.filter(ins => {
    const matchCompany = (ins.nom ?? '').toLowerCase().includes(searchCompany.toLowerCase());
    const matchYear    = searchYear ? (ins.year?.toString() ?? '').includes(searchYear) : true;
    const exp          = isExpiredFn(ins.month, ins.year);
    const matchFilter  = filter === 'all' || (filter === 'expired' ? exp : !exp);
    return matchCompany && matchYear && matchFilter;
  }), [inscs, searchCompany, searchYear, filter]);

  const hasFilters = searchCompany || searchYear || filter !== 'all';

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedEntreprises = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
useEffect(() => { setCurrentPage(1); }, [searchCompany, searchYear, filter]);

  return (
    <div className="min-h-screen text-white p-5 sm:p-8 bg-gradient-to-t from-purple-600 to-purple-700">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { font-family: 'DM Sans', sans-serif; }
        input::placeholder { color: rgba(255,255,255,0.5); }
        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-enter { animation: cardEnter 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .fade-in { animation: fadeIn 0.35s ease both; }
      `}</style>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* ── Header ──────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 mb-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">Espace inscr limités !</h1>
          </div>
          <Link to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/20 text-white/45 hover:text-white/80 text-sm font-medium transition-all duration-300">
            <i className="fa-solid fa-house text-xs" />
            Accueil
          </Link>
        </div>

        {/* ── Search + Filters ────────────────── */}
        <div className="flex flex-col gap-3 mb-8">
          {/* Search row */}
          <div className="flex flex-wrap gap-3">
            {/* Search by company */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/10 flex-1 min-w-[200px] max-w-xs">
              <i className="fa-solid fa-magnifying-glass text-white/60 text-sm" />
              <input
                value={searchCompany}
                onChange={e => setSearchCompany(e.target.value)}
                placeholder="Rechercher par entreprise..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm"
              />
              {searchCompany && (
                <button onClick={() => setSearchCompany('')} className="text-white/60 hover:text-white/55 transition-colors border-0 bg-transparent cursor-pointer text-xs">✕</button>
              )}
            </div>

            {/* Search by year */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-white/10 bg-white/10 min-w-[160px]">
              <i className="fa-solid fa-calendar text-white/60 text-sm" />
              <input
                value={searchYear}
                onChange={e => setSearchYear(e.target.value)}
                placeholder="Année ex: 2025"
                className="flex-1 bg-transparent border-none outline-none text-white text-sm w-28"
              />
              {searchYear && (
                <button onClick={() => setSearchYear('')} className="text-white/60 hover:text-white/55 transition-colors border-0 bg-transparent cursor-pointer text-xs">✕</button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
            <FilterPill label="Tous"    count={counts.all}     active={filter === 'all'}     variant="all"     onClick={() => setFilter('all')} />
            <FilterPill label="Actifs"  count={counts.active}  active={filter === 'active'}  variant="active"  onClick={() => setFilter('active')} />
            <FilterPill label="Expirés" count={counts.expired} active={filter === 'expired'} variant="expired" onClick={() => setFilter('expired')} />
          </div>
          </div>
          
        </div>

        {/* ── Grid ────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-9 h-9 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
            <p className="text-white/60 text-sm">Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 fade-in">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5">
              <i className="fa-solid fa-folder-open text-white/40 text-2xl" />
            </div>
            <p className="text-white/70 font-semibold mb-2">Aucune entreprise trouvée</p>
            {hasFilters && (
              <button
                onClick={() => { setSearchCompany(''); setSearchYear(''); setFilter('all'); }}
                className="text-xs text-white/60 hover:text-white/55 underline underline-offset-2 transition-colors border-0 bg-transparent cursor-pointer mt-1"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-white/70 text-xs mb-5 font-medium">
              {filtered.length} entreprise{filtered.length > 1 ? 's' : ''}
              {hasFilters && ' · filtré'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedEntreprises.map((ins, i) => (
                <InscriptionCard key={ins.id ?? ins.entid ?? i} inscription={ins} index={i} />
              ))}
            </div>
          </>
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
      {filtered.length > 0 && (
        <p className="text-center text-white/40 text-xs mt-3">
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} sur {filtered.length} Entreprises
        </p>
      )}
    </div>
  );
};

export default Inscriptions;
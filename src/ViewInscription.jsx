import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api/axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const DEFAULT_FORM = {month:'', year: ''};

const ViewInscription = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entreprise, setEntreprise]     = useState(null);
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [searchMonth, setSearchMonth]   = useState('');
  const [searchYear, setSearchYear]     = useState('');
  const [sortField, setSortField]       = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  // delete state
  const [deletingId, setDeletingId] = useState(null);

  // popup
  const [popup, setPopup]= useState({ show: false, msg: '', type: 'success' });

  useEffect(() => { fetchData(); }, [id]);

  const showPopup = (msg, type = 'success') => {
    setPopup({ show: true, msg, type });
    setTimeout(() => setPopup(p => ({ ...p, show: false })), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const entRes = await api.get(`/entreprises/${id}`);
      setEntreprise(entRes.data.entreprise);

      try {
        const insRes = await api.get(`/insc/${id}`);
        const raw = insRes.data.inscriptions ?? insRes.data;
        setInscriptions(Array.isArray(raw) ? raw : Object.values(raw));
      } catch (insErr) {
        if (insErr.response?.status === 404) setInscriptions([]);
        else throw insErr;
      }
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  // ── Add inscription ──────────────────────────────────
  const handleSubmit = async (ev) => {
  ev.preventDefault();
  setSubmitting(true);
  try {
    const data={...formData,entrepriseID:id,abonnementID:entreprise.abonnement_id,price:entreprise.abonnement_price,
    }
    const response = await api.post('/insc',data);
    if (response.data) {
    setFormData(DEFAULT_FORM);
    setShowForm(false);
    await fetchData();
  }
    showPopup('✅ Inscription ajoutée avec succès !');
  } catch (err) {
    console.error(err);
    showPopup("❌ Erreur lors de l'ajout.", 'error');
  } finally {
    setSubmitting(false);
  }
};

  // ── Delete inscription ───────────────────────────────
  const handleDelete = async (insId) => {
    if (!window.confirm('Supprimer cette inscription ?')) return;
    setDeletingId(insId);
    try {
      await api.delete(`/insc/${insId}`);
      setInscriptions(prev => prev.filter(ins => ins.id !== insId));
      showPopup('🗑️ Inscription supprimée.');
    } catch (err) {
      console.error(err);
      showPopup('❌ Erreur lors de la suppression.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD', minimumFractionDigits: 2 });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <i className="fa-solid fa-sort text-white/30 ml-1 text-xs" />;
    return <i className={`fa-solid fa-sort-${sortDir === 'asc' ? 'up' : 'down'} ml-1 text-xs text-white`} />;
  };

  const filtered = inscriptions
    .filter(ins => {
      const matchMonth = (ins.month?.toString() ?? '').includes(searchMonth);
      const matchYear  = (ins.year?.toString()  ?? '').includes(searchYear);
      return matchMonth && matchYear;
    })
    .sort((a, b) => {
      let va = a[sortField] ?? '';
      let vb = b[sortField] ?? '';
      if (sortField === 'price') { va = Number(va); vb = Number(vb); }
      if (sortField === 'created_at' ) { va = new Date(va); vb = new Date(vb); }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPrice = filtered.reduce((s, ins) => s + Number(ins.price ?? 0), 0);

  const COLS = [
    { label: '#',          field: 'id'           },
    { label: 'Abonnement', field: 'abonnementID' },
    { label: 'Mois',       field: 'month'        },
    { label: 'Année',      field: 'year'         },
    { label: 'Prix',       field: 'price'        },
    { label: 'Créé le',    field: 'created_at'   },
    { label: '',           field: 'actions'      }, // delete column
  ];

  const Stars = ({ rating }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <i key={n} className={`fa-star text-xs ${n <= (rating ?? 0) ? 'fa-solid text-yellow-400' : 'fa-regular text-white/20'}`} />
      ))}
    </div>
  );

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm text-gray-800";
  const labelClass = "block text-sm font-semibold mb-1.5 text-gray-700";

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-t from-purple-600 to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="font-semibold">Chargement...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-t from-purple-600 to-purple-700 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-triangle-exclamation text-red-500 text-2xl" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
        <p className="text-gray-500 mb-6 text-sm">{error}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-all border-0 cursor-pointer">
          Retour
        </button>
      </div>
    </div>
  );

  const e = entreprise;

  return (
    <div className="min-h-screen bg-gradient-to-t from-purple-600 to-purple-700 text-white p-4 sm:p-6 lg:p-8">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        input::placeholder { color: rgba(255,255,255,0.55); }
        ::-webkit-scrollbar { height: 5px; width: 5px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.08); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 10px; }
      `}</style>

      {/* ── Popup toast ─────────────────────────────── */}
      <div className={`fixed top-6 right-6 z-[200] transition-all duration-500 ${popup.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}`}>
        <div className={`px-5 py-3 rounded-2xl shadow-2xl font-semibold text-sm border ${
          popup.type === 'error'
            ? 'bg-red-50 text-red-700 border-red-100'
            : 'bg-white text-gray-800 border-gray-100'
        }`}>
          {popup.msg}
        </div>
      </div>

      {/* ── Slide-in Add Form ────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowForm(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-500 ease-in-out ${showForm ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 sm:p-8">
          {/* Form header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-purple-700">
              <i className="fa-solid fa-plus mr-2" />
              Nouvelle inscription
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:rotate-90 duration-300 border-0 cursor-pointer"
            >
              <i className="fa-solid fa-times text-gray-500 text-lg" />
            </button>
          </div>

          {/* Entreprise badge */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-building text-white text-sm" />
            </div>
            <div>
              <p className="text-xs text-purple-400 font-medium">Entreprise</p>
              <p className="text-sm font-bold text-purple-800">{e?.nom ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-6 p-3 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-star mr-1.5 text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-400 font-medium">Type D'Abonnement </p>
              <p className="text-sm font-bold text-purple-800">{e?.abonnement_type ?? '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6 p-3 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-coins mr-1.5 text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-400 font-medium">Les Fraix </p>
              <p className="text-sm font-bold text-purple-800">{e?.abonnement_price ?? '—'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <i className="fa-solid fa-calendar mr-1.5 text-purple-500" />
                  Mois <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.month}
                  onChange={ev => setFormData(p => ({ ...p, month: ev.target.value }))}
                  required
                  className={inputClass}
                >
                  <option value="">Mois</option>
                  {['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'].map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  <i className="fa-solid fa-calendar-days mr-1.5 text-purple-500" />
                  Année <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={ev => setFormData(p => ({ ...p, year: ev.target.value }))}
                  required
                  placeholder={new Date().getFullYear()}
                  min="2000"
                  max="2100"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-5 py-3 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-all border-0 cursor-pointer"
              >
                <i className="fa-solid fa-times mr-2" />
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-0 cursor-pointer"
              >
                {submitting
                  ? <><i className="fa-solid fa-spinner fa-spin mr-2" />Envoi...</>
                  : <><i className="fa-solid fa-check mr-2" />Enregistrer</>
                }
              </button>
            </div>
          </form>
          
        </div>
      </div>

      {/* ── Back ────────────────────────────────────── */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 border-0 bg-transparent cursor-pointer text-sm">
        <i className="fa-solid fa-arrow-left" />
        Retour
      </button>

      {/* ── Company hero ────────────────────────────── */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">

          {e?.logo ? (
            <img src={`${BASE_URL}/${e.logo}`} alt={e.nom} className="w-24 h-24 rounded-2xl object-cover shadow-lg flex-shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
              <i className="fa-solid fa-building text-white text-4xl" />
            </div>
          )}

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold truncate">{e?.nom ?? '—'}</h1>
              {e?.status && (
                <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${
                  e.status === 'active' ? 'bg-green-400/20 border-green-400/50 text-green-400' : 'bg-red-400/20 border-red-400/50 text-red-400'
                }`}>
                  {e.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
              {e?.secteur && <p className="text-white/60 text-sm">{e.secteur}</p>}
              {e?.rating && <Stars rating={e.rating} />}
            </div>
            {e?.responsable && (
              <p className="text-white/70 text-sm mb-3 flex items-center justify-center sm:justify-start gap-2">
                <i className="fa-solid fa-user text-white/40" /> {e.responsable}
              </p>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              {e?.location && <span className="flex items-center gap-1.5 text-xs text-white/75 bg-white/10 px-3 py-1 rounded-full border border-white/15"><i className="fa-solid fa-location-dot" /> {e.location}</span>}
              {e?.email && <span className="flex items-center gap-1.5 text-xs text-white/75 bg-white/10 px-3 py-1 rounded-full border border-white/15"><i className="fa-solid fa-envelope" /> {e.email}</span>}
              {e?.phone1 && <span className="flex items-center gap-1.5 text-xs text-white/75 bg-white/10 px-3 py-1 rounded-full border border-white/15"><i className="fa-solid fa-phone" /> {e.phone1}</span>}
              {e?.phone2 && <span className="flex items-center gap-1.5 text-xs text-white/75 bg-white/10 px-3 py-1 rounded-full border border-white/15"><i className="fa-solid fa-phone" /> {e.phone2}</span>}
              {e?.type_abonnement && <span className="flex items-center gap-1.5 text-xs bg-purple-400/20 px-3 py-1 rounded-full border border-purple-400/30 text-purple-200"><i className="fa-solid fa-star" /> {e.type_abonnement}</span>}
            </div>
          </div>

          <div className="flex sm:flex-col gap-3 flex-shrink-0">
            <div className="bg-white/10 rounded-2xl px-4 py-3 text-center border border-white/20 min-w-[80px]">
              <p className="text-2xl font-bold">{inscriptions.length}</p>
              <p className="text-xs text-white/60 mt-0.5">Inscriptions</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3 text-center border border-white/20 min-w-[100px]">
              <p className="text-base font-bold text-emerald-300">{formatPrice(totalPrice)}</p>
              <p className="text-xs text-white/60 mt-0.5">Total payé</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters + Add button ─────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[180px] flex items-center gap-3 px-5 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
          <i className="fa-solid fa-magnifying-glass text-white/50 text-sm" />
          <input value={searchMonth} onChange={e => setSearchMonth(e.target.value)} placeholder="Filtrer par mois" className="flex-1 bg-transparent border-none outline-none text-white text-xs" />
        </div>
        <div className="flex-1 min-w-[180px] flex items-center gap-3 px-5 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
          <i className="fa-solid fa-magnifying-glass text-white/50 text-sm" />
          <input value={searchYear} onChange={e => setSearchYear(e.target.value)} placeholder="Filtrer par année" className="flex-1 bg-transparent border-none outline-none text-white text-xs" />
        </div>
        <div className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
          <i className="fa-solid fa-filter text-white/50 text-xs" />
          <span className="text-xs text-white/70">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* ✅ Add button */}
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white text-purple-700 font-semibold text-sm hover:bg-purple-50 hover:scale-105 transition-all duration-300 shadow-lg border-0 cursor-pointer"
        >
          <i className="fa-solid fa-plus" />
          Ajouter
        </button>
      </div>

      {/* ── Table ────────────────────────────────────── */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-xl">
        {inscriptions.length === 0 ? (
          <div className="text-center py-20 text-white/50">
            <i className="fa-solid fa-clipboard text-4xl block mb-3" />
            <p className="font-medium">Aucune inscription pour cette entreprise</p>
            <p className="text-xs mt-1 text-white/35">Cliquez sur "Ajouter" pour créer la première</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/50">
            <i className="fa-solid fa-magnifying-glass text-4xl block mb-3" />
            <p>Aucun résultat pour ce filtre</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  {COLS.map(col => (
                    <th
                      key={col.field}
                      onClick={() => col.field !== 'actions' && handleSort(col.field)}
                      className={`text-left px-5 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider select-none whitespace-nowrap ${col.field !== 'actions' ? 'cursor-pointer hover:text-white transition-colors' : ''}`}
                    >
                      {col.label}
                      {col.field !== 'actions' && <SortIcon field={col.field} />}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {filtered.map(ins => (
                  <tr key={ins.id} className="hover:bg-white/10 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-white/40">#{ins.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-400/20 border border-purple-400/30 text-purple-200">
                        {ins.abonnement_type ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-white font-medium whitespace-nowrap">
                      {ins.month ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-sm text-white/70 whitespace-nowrap">
                      {ins.year ?? '—'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-300">
                        {ins.price != null ? formatPrice(ins.price) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-white/55 whitespace-nowrap">
                      {formatDate(ins.inscription_created_at)}
                    </td>


                    {/* ✅ Delete button */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleDelete(ins.id)}
                        disabled={deletingId === ins.id}
                        className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500 border border-red-500/30 flex items-center justify-center transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                      >
                        {deletingId === ins.id
                          ? <i className="fa-solid fa-spinner fa-spin text-red-300 text-xs" />
                          : <i className="fa-solid fa-trash text-red-300 text-xs" />
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t-2 border-white/20 bg-white/5">
                  <td colSpan={4} className="px-5 py-4 text-sm font-bold text-white/60 text-right whitespace-nowrap">
                    Total — {filtered.length} inscription{filtered.length !== 1 ? 's' : ''}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-emerald-300 whitespace-nowrap">
                    {formatPrice(filtered.reduce((s, ins) => s + Number(ins.price ?? 0), 0))}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewInscription;
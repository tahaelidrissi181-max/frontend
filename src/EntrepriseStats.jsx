import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "./api/axios";
import { useStateContext } from "./Context/contextproviders";

const AnimatedNumber = ({ target, suffix = "" }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    let start = 0;
    const num = Number(target);
    const step = Math.ceil(num / 60) || 1;
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setVal(num); clearInterval(timer); }
      else setVal(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{Number(val).toLocaleString("fr-FR")}{suffix}</>;
};

const AnimatedBar = ({ pct, color, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setWidth(0);
    const t = setTimeout(() => setWidth(pct), 300 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out shadow-lg`}
        style={{ width: `${width}%` }} />
    </div>
  );
};

export default function EntrepriseStats() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const { user } = useStateContext();  

  const fetchStats = async () => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/entrstats", {
        params: { startDate: dateFrom, endDate: dateTo,id:user[0].entrepriseID }
      });
      setData(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des statistiques.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [dateFrom, dateTo]);

  const statsCards = data ? [
    {icon:"fa-file-alt",label:"Demandes (en attente, annulées)",value:data.total_demandes,suffix:""},
    {icon:"fa-handshake",label:"Réunions",value:data.total_reunions,suffix:""},
    {icon: "fa-tools",label: "Mise en place",value: data.total_mise,            suffix: "",},
    {icon:"fa-wallet",label:"Fraix des inscriptions",value: data.total_insc,suffix:" DH"},
    {icon:"fa-user-clock",label:"Nombres Des Inscriptions",value:data.inscriptions_limitees, suffix: ""},
  ] : [];

  // Compute bar percentages from real data
  const totalDemandes = data ? (Number(data.total_demandes) + Number(data.total_reunions)) || 1 : 1;
  const bars = data ? [
    {
      label: "Taux de traitement des demandes",
      pct: Math.round((Number(data.total_reunions) / totalDemandes) * 100),
      color: "from-violet-400 to-purple-600"
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0533] via-[#2d1060] to-[#0f0224] text-white">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-fuchsia-700/15 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-[400px] h-[400px] rounded-full bg-indigo-700/20 blur-[100px]" />
      </div>

      <div className="relative z-10 p-5 lg:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-[0.25em] mb-1 font-medium">Vue d'ensemble</p>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Tableau de bord
            </h1>
          </div>
          <Link to="/" className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 transition-all text-sm font-semibold backdrop-blur-sm">
            <i className="fa-solid fa-arrow-left text-xs" />Retour
          </Link>
        </div>

        {/* Date filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 flex-1">
            <i className="fa-solid fa-calendar-day text-purple-400 text-sm w-4" />
            <label className="text-xs text-white/50 whitespace-nowrap">Du</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all [color-scheme:dark]" />
          </div>
          <div className="flex items-center gap-3 flex-1">
            <i className="fa-solid fa-calendar-check text-fuchsia-400 text-sm w-4" />
            <label className="text-xs text-white/50 whitespace-nowrap">Au</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all [color-scheme:dark]" />
          </div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(""); setDateTo(""); setData(null); }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold transition-all whitespace-nowrap">
              <i className="fa-solid fa-times mr-1.5" />Réinitialiser
            </button>
          )}
        </div>

        {/* Empty state — no dates selected */}
        {!dateFrom && !dateTo && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <i className="fa-solid fa-calendar-days text-3xl text-white/30" />
            </div>
            <p className="text-white/50 text-lg font-semibold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Sélectionnez une période
            </p>
            <p className="text-white/30 text-sm">Choisissez une date de début et de fin pour afficher les statistiques.</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-purple-400" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm mb-6">
            <i className="fa-solid fa-circle-exclamation" />{error}
          </div>
        )}

        {/* Stat cards */}
        {data && !loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {statsCards.map((s, i) => (
                <div key={i}
                  className="group relative rounded-3xl p-6 bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 hover:border-white/25 backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-purple-500/10 to-fuchsia-500/5" />
                  <div className="relative flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 group-hover:bg-white/15 flex items-center justify-center transition-all">
                      <i className={`fa-solid ${s.icon} text-base text-white/80`} />
                    </div>
                    
                  </div>
                  <p className="text-white/50 text-xs font-medium mb-1">{s.label}</p>
                  <p className="text-4xl font-black tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <AnimatedNumber target={Number(s.value) || 0} suffix={s.suffix} />
                  </p>
                </div>
              ))}
            </div>

            {/* Performance bars */}
            <div className="rounded-3xl p-6 lg:p-8 bg-white/[0.05] border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <i className="fa-solid fa-chart-line text-purple-400 text-sm" />
                </div>
                <h2 className="text-lg font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>Performance sur la période</h2>
                <span className="ml-auto text-xs text-white/30">{dateFrom} → {dateTo}</span>
              </div>
              <div className="space-y-6">
                {bars.map((b, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-white/70">{b.label}</span>
                      <span className="text-sm font-bold tabular-nums" style={{ fontFamily: 'Outfit, sans-serif' }}>{b.pct}%</span>
                    </div>
                    <AnimatedBar pct={b.pct} color={b.color} delay={i * 150} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
      <style>{`* { font-family: 'DM Sans', sans-serif; }`}</style>
    </div>
  );
}
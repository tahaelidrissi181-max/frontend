import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from './api/axios';

const OuvrierProfile = () => {
  const { id } = useParams();
  const [ouvrier, setOuvrier] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(null);
  useEffect(() => {
    const fetchOuvrier = async () => {
      try {
        const res = await api.get(`/ouvrier/${id}`);
        setOuvrier(res.data.worker); 
      } catch (err) {
        console.error("Error fetching worker:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOuvrier();
  }, [id]);

  const [activeTab, setActiveTab] = useState('about');

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fa-solid fa-star ${index < rating ? 'text-amber-400' : 'text-gray-300'}`}
      ></i>
    ));
  };

  const handleContact = async (type) => {
  let value = '';

  if (type === 'phone') {
    value = ouvrier[0].phone;
  }

  if (type === 'email') {
    value = ouvrier[0].email;
  }

  try {
    await navigator.clipboard.writeText(value);
    setCopied(type); // to show feedback
    setTimeout(() => setCopied(null), 2000);
  } catch (err) {
    console.error('Erreur copie:', err);
  }
};

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // Error state - ouvrier not found
  if (!ouvrier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-user-slash text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ouvrier introuvable</h2>
          <p className="text-gray-600 mb-6">Cet ouvrier n'existe pas ou a été supprimé.</p>
          <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group"
    >
      <i className="fa-solid fa-arrow-left"></i>
      Retour
    </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <link 
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" 
        rel="stylesheet"
      />

      {/* Header with back button */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group"
    >
      <i className="fa-solid fa-arrow-left"></i>
      Retour
    </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden sticky top-24 border border-gray-100">
              {/* Profile Header with gradient */}
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="relative">
                  {/* Photo */}
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-white/30 shadow-2xl overflow-hidden bg-white/20 backdrop-blur-sm">
                    {ouvrier[0].photo ? (
                      <img 
                        src={`http://localhost:5000/${ouvrier[0].photo}`}
                        alt={ouvrier[0].nom_complet}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="fa-solid fa-user text-5xl text-white/80"></i>
                      </div>
                    )}
                  </div>

                  {/* Name & Status */}
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">
                      {ouvrier[0].nom_complet}
                    </h1>
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <div className={`w-2 h-2 rounded-full ${ouvrier[0].status === 'available' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                      <span className="text-white text-sm font-medium">
                        {ouvrier[0].status === 'available' ? 'Disponible' : 'Occupé'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6 space-y-6">
                {/* Rating */}
                <div className="text-center pb-6 border-b border-gray-100">
                  <div className="flex justify-center gap-1 mb-2">
                    {renderStars(ouvrier[0].ranking || 5)}
                  </div>
                  <p className="text-sm text-gray-500">
                    {parseInt(ouvrier[0].ranking)|| 5} sur 5
                  </p>
                </div>

                <div className="pt-6 space-y-3">

  {/* PHONE */}
  <button
    onClick={() => handleContact('phone')}
    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
  >
    <i className="fa-solid fa-phone"></i>
    {copied === 'phone' ? 'Numéro copié ✓' : 'Copier le numéro'}
  </button>

  {/* EMAIL */}
  {ouvrier[0].email && (
    <button
      onClick={() => handleContact('email')}
      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
    >
      <i className="fa-solid fa-envelope"></i>
      {copied === 'email' ? 'Email copié ✓' : 'Copier l’email'}
    </button>
  )}

</div>
              </div>
            </div>
          </div>

          {/* Right Content - Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
              {/* Tabs */}
              <div className="border-b border-gray-100">
                <div className="flex overflow-x-auto">
                  {[
                    { id: 'about', label: 'À propos', icon: 'fa-user' },
                    { id: 'skills', label: 'Compétences', icon: 'fa-star' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 min-w-fit px-6 py-4 font-semibold transition-all relative ${
                        activeTab === tab.id
                          ? 'text-indigo-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <i className={`fa-solid ${tab.icon} text-sm`}></i>
                        <span>{tab.label}</span>
                      </div>
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-8 animate-fadeIn">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                        <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                        Informations Générales
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                          <p className="text-sm text-gray-500 mb-1">Nom complet</p>
                          <p className="font-semibold text-gray-900">{ouvrier[0].nom_complet}</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                          <p className="text-sm text-gray-500 mb-1">Spécialité</p>
                          <p className="font-semibold text-gray-900">{ouvrier[0].specialite}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                          <p className="text-sm text-gray-500 mb-1">Expérience</p>
                          <p className="font-semibold text-gray-900">{ouvrier[0].experience}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                          <p className="text-sm text-gray-500 mb-1">Localisation</p>
                          <p className="font-semibold text-gray-900">{ouvrier[0].localisation}</p>
                        </div>
                        {ouvrier[0].email && (
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">Email</p>
                            <p className="font-semibold text-gray-900 truncate">{ouvrier[0].email}</p>
                          </div>
                        )}
                        {ouvrier[0].phone && (
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                            <p className="font-semibold text-gray-900">{ouvrier[0].phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="space-y-6 animate-fadeIn">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                      Education
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {ouvrier[0].education?ouvrier[0].education.split(',').map((c, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl text-center group hover:from-indigo-100 hover:to-purple-100 transition-all cursor-default"
                        >
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-check text-indigo-600"></i>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{c}</p>
                        </div>
                      )):<p className='pl-4 font-semibold text-gray-900 text-md'>No Education Infos </p>}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                      Compétences
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {ouvrier[0].competence?ouvrier[0].competence.split(',').map((c, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl text-center group hover:from-indigo-100 hover:to-purple-100 transition-all cursor-default"
                        >
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-check text-indigo-600"></i>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{c}</p>
                        </div>
                      )):<p className='pl-4 font-semibold text-gray-900 text-md'>No Compétences </p>}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                      Langues
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {ouvrier[0].langues?ouvrier[0].langues.split(',').map((c, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl text-center group hover:from-indigo-100 hover:to-purple-100 transition-all cursor-default"
                        >
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fa-solid fa-check text-indigo-600"></i>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{c}</p>
                        </div>
                      )):<p className='pl-4 font-semibold text-gray-900 text-md'>No Langues </p>}
                    </div>

                    
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default OuvrierProfile;
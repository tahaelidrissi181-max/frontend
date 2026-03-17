import { useStateContext } from "./Context/contextproviders";
import { Link } from 'react-router-dom';
import EditEntrepriseProfile from "./EditEntrepriseProfile";
import SidePopup from "./SidePopup";
import { useState } from "react";
import { useEffect } from "react";
import api from "./api/axios";
const defaultForm = {
  name: '',
  email: '',
  password: '',
  role: 'support',
  status: 'active',
}

const UserForm = ({ isOpen, onClose}) => {
    const { user } = useStateContext();  
  const [formData, setFormData] = useState(defaultForm)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const editingUser = user[0]
  const [showPopup, setShowPopup] = useState(false)
const [popupMsg, setPopupMsg] = useState('')
  useEffect(() => {
    if (!isOpen) return
    setFormData({ name: editingUser.name ?? '', email: editingUser.email ?? '', password: '', role: editingUser.role ?? 'support', status: editingUser.status ?? 'active' }
    )
    setShowPassword(false)
    setFormError('')
  }, [isOpen, editingUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'email') setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError('')
    const payload = { ...formData }
    try {
      await api.put(`/users/${editingUser.id}`, payload)
      notify('✅ Utilisateur mis à jour avec succès !')
      onClose()
    } catch (err) {
      if (err.response?.status === 409) {
        setFormError('Cet email est déjà utilisé par un autre compte.')
      } else if (err.response?.status === 400) {
        setFormError(err.response.data?.message ?? 'Données invalides.')
      } else {
        setFormError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const notify = (msg) => {
    setPopupMsg(msg)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3500)
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      )}
      <SidePopup
      message={popupMsg}
      type="success"
      show={showPopup}
      onClose={() => setShowPopup(false)}
    />
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-purple-700">
              <i className={`fa-solid 'fa-user-pen'  mr-2`}></i>
              Modifier utilisateur
            </h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:rotate-90 duration-300">
              <i className="fa-solid fa-times text-gray-600"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-black">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-user mr-2 text-purple-600"></i>
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ex: Ahmed Benali" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-envelope mr-2 text-purple-600"></i>
                Email <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${formError ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'border-gray-300 focus:ring-purple-500'}`}
                placeholder="exemple@email.com" />
              {formError && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-exclamation" />
                  {formError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-lock mr-2 text-purple-600"></i>
                Mot de passe 
                 <span className="text-xs text-gray-400 font-normal ml-1">(laisser vide pour ne pas changer)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder='••••••••'
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors">
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-shield-halved mr-2 text-purple-600"></i>
                Rôle <span className="text-red-500">*</span>
              </label>
              <select name="role" value={formData.role} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                <option value="support">Support</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-circle-check mr-2 text-purple-600"></i>
                Statut
              </label>
              <select name="status" value={formData.status} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all">
                <i className="fa-solid fa-times mr-2"></i>Annuler
              </button>
              <button type="submit" disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {isSubmitting
                  ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Envoi...</>
                  : <><i className="fa-solid fa-check mr-2"></i>Enregistrer</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

const Dashboard = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { user } = useStateContext();  
  const [selectedEntreprise, setSelectedEntreprise] = useState(null)
  const [showForm, setShowForm] = useState(false)
  
  const [message, setMessage] = useState('');
  const dashboardCards = [
    { id: 1, href: 'statistics', color: 'bg-blue-600', icon: 'fa-chart-line', label: 'Tableau de bord' },
    { id: 9, href: 'Insc', color: 'bg-orange-600', icon: 'fa-user-clock', label: 'Insc limité' },
    { id: 2, href: 'entreprises', color: 'bg-green-600', icon: 'fa-building', label: 'Entreprises Gerer' },
    { id: 3, href: 'ouvriers', color: 'bg-red-500', icon: 'fa-hard-hat', label: 'Ouvrie Gerer' },
    { id: 4, href: 'demandes', color: 'bg-yellow-600', icon: 'fa-file-alt', label: 'Demandes' },
    { id: 5, href: 'réunions', color: 'bg-purple-600', icon: 'fa-handshake', label: 'Réunions' },
    { id: 6, href: 'mise-en-place', color: 'bg-pink-600', icon: 'fa-tools', label: 'Mise en place' },
    { id: 7, href: 'utilisateurs', color: 'bg-red-600', icon: 'fa-users-cog', label: 'Gestion users' },
    { id: 8, href: 'abonnements', color: 'bg-teal-600', icon: 'fa-credit-card', label: 'Gestion abonnements' }
  ];

const clientCards = [
    { id: 1, href: 'statistics', color: 'bg-blue-600', icon: 'fa-chart-line', label: 'Tableau de bord' },
    { id: 9, href: `insc/${user[0].entrepriseID}`, color: 'bg-orange-600', icon: 'fa-user-clock', label: 'Insc limité' },
    { id: 4, href: 'demandes', color: 'bg-yellow-600', icon: 'fa-file-alt', label: 'Demandes' },
    { id: 5, href: 'réunions', color: 'bg-purple-600', icon: 'fa-handshake', label: 'Réunions' },
    { id: 6, href: 'mise-en-place', color: 'bg-pink-600', icon: 'fa-tools', label: 'Mise en place' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-t from-purple-600  to-purple-700  text-white p-3 sm:p-4 md:p-6">
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Header Section */}
      <div className="flex justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pr-0 sm:pr-32 animate-fadeIn">
        <div className="welcome-text">
          <h1 className="text-base sm:text-lg md:text-xl font-medium mb-1">Bienvenue <span className="font-bold">
  {user[0].name.charAt(0).toUpperCase() + user[0].name.slice(1)}
</span></h1>
          <p className="text-xs sm:text-sm opacity-85">Gérez votre plateforme Optijob</p>
        </div>
        
        <div className="flex items-center gap-2 notification-container">
          <button 
            onClick={() => {
    localStorage.removeItem("token"); // remove auth token
    window.location.href = "/";  // redirect to login page
  }}
            className="bg-white/15 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white/25 text-white font-medium flex items-center gap-2 transition-all hover:bg-[#ff4757] hover:-translate-y-0.5 text-xs sm:text-sm"
          >
            <i className="fa-solid fa-power-off"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-7xl mx-auto animate-slideUp">
        {user[0].role =="client"? <>{clientCards.map((card, index) => (
          <Link
            key={card.id}
            to={card.href}
            state={{ fromApp: true }}
            className={`h-28 sm:h-32 md:h-36 rounded-2xl sm:rounded-3xl flex items-center justify-center relative overflow-hidden transition-all  shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-100 duration-300 ${card.color} group`}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r rounded-2xl sm:rounded-3xl from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            
            <div className="bg-white/20 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-3.5 rounded-full flex items-center gap-2 sm:gap-3 border border-white/25 transition-all group-hover:bg-white/30 group-hover:scale-105 relative z-10">
              <i className={`fa-solid ${card.icon} text-xs sm:text-sm`}></i>
              <span className="font-medium text-xs sm:text-sm">{card.label}</span>
            </div>
          </Link>
        ))}
        <button
            onClick={() => setSelectedEntreprise(true)}
            className={`h-28 sm:h-32 md:h-36 rounded-2xl sm:rounded-3xl flex items-center justify-center relative overflow-hidden transition-all  shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-100 duration-300 bg-teal-600 group`}
            style={{ animationDelay: `${5 * 0.08}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r rounded-2xl sm:rounded-3xl from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            
            <div className="bg-white/20 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-3.5 rounded-full flex items-center gap-2 sm:gap-3 border border-white/25 transition-all group-hover:bg-white/30 group-hover:scale-105 relative z-10">
              <i className={`fa-solid fa-user text-xs sm:text-sm`}></i>
              <span className="font-medium text-xs sm:text-sm">Profile</span>
            </div>
          </button></>
        :<>
  {dashboardCards.map((card, index) => (
    user[0].role =="support" && card.href=='utilisateurs' ? null :
    <Link
      key={card.id}
      to={card.href}
      state={{ fromApp: true }}
      className={`h-28 sm:h-32 md:h-36 rounded-2xl sm:rounded-3xl flex items-center justify-center relative overflow-hidden transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-100 duration-300 ${card.color} group`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r rounded-2xl sm:rounded-3xl from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
      <div className="bg-white/20 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-3.5 rounded-full flex items-center gap-2 sm:gap-3 border border-white/25 transition-all group-hover:bg-white/30 group-hover:scale-105 relative z-10">
        <i className={`fa-solid ${card.icon} text-xs sm:text-sm`}></i>
        <span className="font-medium text-xs sm:text-sm">{card.label}</span>
      </div>
    </Link>
  ))}
  <button
    onClick={() => setShowForm(true)}
    className="h-28 sm:h-32 md:h-36 rounded-2xl sm:rounded-3xl flex items-center justify-center relative overflow-hidden transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-100 duration-300 bg-rose-500  group"
    style={{ animationDelay: `${5 * 0.08}s` }}
  >
    <div className="absolute inset-0 bg-gradient-to-r rounded-2xl sm:rounded-3xl from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
    <div className="bg-white/20 backdrop-blur-md px-6 sm:px-8 py-3 sm:py-3.5 rounded-full flex items-center gap-2 sm:gap-3 border border-white/25 transition-all group-hover:bg-white/30 group-hover:scale-105 relative z-10">
      <i className="fa-solid fa-user text-xs sm:text-sm"></i>
      <span className="font-medium text-xs sm:text-sm">Profile</span>
    </div>
  </button>
</>}
      </div>

      <SidePopup
              message={message}
              type="success"
              show={showPopup}
              onClose={() => setShowPopup(false)}
      />

      <EditEntrepriseProfile 
  isOpen={selectedEntreprise !== null}
  onClose={() => setSelectedEntreprise(null)}
  onUpdate={() => {
    setSelectedEntreprise(null)
    setShowPopup(true)
    setMessage("✅ L'entreprise a été mise à jour avec succès !")
  }}
      />

      <UserForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * {
          font-family: 'Poppins', sans-serif;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease;
        }

        .animate-slideUp {
          animation: slideUp 0.7s ease;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease;
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(255,71,87,0.7); 
          }
          50% { 
            transform: scale(1.1); 
            box-shadow: 0 0 0 10px rgba(255,71,87,0); 
          }
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
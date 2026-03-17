import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api/axios';
import SidePopup from './SidePopup';
import EditEntreprise from './EditEntreprise';

const Entreprise = () => {
  const [searchSpeciality, setSearchSpeciality] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [searchEntreprise, setSearchEntreprise] = useState('');
  const [selectedEntreprise, setSelectedEntreprise] = useState(null)
  const [entreprisesData, setEntreprisesData] = useState([]);
  const [abonnement, setAbonnement] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [contract, setContract] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    nom_entreprise: '',
    secteur_activite: '',
    responsable: '',
    localisation: '',
    abonnement: 1,
    ranking: 5,
    phone1: '',
    phone2: '',
    email: '',
    status: 'active',
    password:'',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  useEffect(() => {
    fetchEntreprises();
    fetchAbonnement();
  }, []);

  const fetchEntreprises = () => {
    api
      .get('/entreprises')
      .then(res => {
        setEntreprisesData(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };
  const fetchAbonnement = () => {
    api
      .get('/abonnement')
      .then(res => {
        setAbonnement(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const filteredEntreprises = entreprisesData.filter(entreprise => {
    const secteurMatch = entreprise.secteur.toLowerCase().includes(searchSpeciality.toLowerCase());
    const statusMatch = statusFilter === 'all' || entreprise.status === statusFilter;
    const nameMatch = entreprise.nom.toLowerCase().includes(searchEntreprise.toLowerCase());
    return secteurMatch && nameMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredEntreprises.length / ITEMS_PER_PAGE);
  const paginatedEntreprises = filteredEntreprises.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
useEffect(() => { setCurrentPage(1); }, [searchEntreprise, searchSpeciality, statusFilter]);

  const handleAddEntreprise = () => {
    setShowAddForm(true);
    setFormData({
      nom_entreprise: '',
      secteur_activite: '',
      responsable: '',
      localisation: '',
      abonnement: 1,
      ranking: 5,
      phone1: '',
      phone2: '',
      email: '',
      password: '',
      status: 'active',
      image: null
    });
    setImagePreview(null);
    setContract(null);
    setShowPassword(false)

  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setImagePreview(null);
    setContract(null);
    setShowPassword(false)
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('❌ Format d\'image non valide. Utilisez JPG, PNG, GIF ou WebP');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('❌ L\'image est trop grande. Taille maximum: 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const submitData = new FormData();
    submitData.append('nom', formData.nom_entreprise);
    submitData.append('secteur', formData.secteur_activite);
    submitData.append('responsable', formData.responsable);
    submitData.append('location', formData.localisation);
    submitData.append('type_abonnement', formData.abonnement);
    submitData.append('rating', formData.ranking);
    submitData.append('phone1', formData.phone1);
    submitData.append('phone2', formData.phone2);
    submitData.append('email', formData.email);
    submitData.append('status', formData.status);
    submitData.append('password', formData.password);

    
    if (formData.image) {
      submitData.append('logo', formData.image);
    }
    if (contract) {
      submitData.append('contrat', contract);
    }

    const response = await api.post('/entreprises', submitData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // ✅ Succès
    setShowAddForm(false);
    fetchEntreprises();
    setFormData({
      nom_entreprise: '',
      secteur_activite: '',
      responsable: '',
      localisation: '',
      abonnement: 1,
      ranking: 5,
      phone1: '',
      phone2: '',
      email: '',
      status: 'active',
      image: null
    });
    setImagePreview(null);
    setContract(null)
    setContract(null);
    setMessage("✅ L'entreprise a été ajoutée avec succès !");
    setShowPopup(true);

  } catch (error) {
    
    if (error.response?.status === 400) {
      const errorMessage = error.response.data.message;
      const errorField = error.response.data.field;
      
      setMessage(`❌ ${errorMessage}`);
      setShowPopup(true);
      
      const fieldMapping = {
        'email': 'email',
        'phone1': 'phone1'
      };
      
      const inputName = fieldMapping[errorField];
      if (inputName) {
        const fieldInput = document.querySelector(`input[name="${inputName}"]`);
        if (fieldInput) {
          fieldInput.classList.add('border-red-500', 'ring-2', 'ring-red-500');
          fieldInput.focus();
          setTimeout(() => {
            fieldInput.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
          }, 3000);
        }
      }
    } else {
      setMessage('❌ Erreur lors de l\'ajout de l\'entreprise');
      setShowPopup(true);
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const handleDelete = async (id) => {
      if (!window.confirm("Voulez-vous vraiment supprimer cet Entreprise ?")) {
        return false
  }
      try {
      await api.delete(`/entreprise/${id}`);
      fetchEntreprises();
      setShowPopup(true);
      setMessage("✅ L'entreprise a été supprimée avec succès !");
      } catch (error) {
        console.error('Error updating demande:', error);
        alert("❌ Erreur lors de la mise à jour du statut.");
      }
    };
  

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`fa-solid fa-star ${index < rating ? 'text-yellow-400' : 'text-gray-400'}`}
      ></i>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-purple-600 to-purple-700 text-white p-4 sm:p-6 lg:p-8">
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Overlay */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleCloseForm}
        ></div>
      )}

      {/* Slide-in Form Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white text-gray-800 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out overflow-y-auto ${
        showAddForm ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 sm:p-8">
          {/* Form Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-700">
              <i className="fa-solid fa-building mr-2"></i>
              Ajouter une nouvelle entreprise
            </h2>
            <button
              onClick={handleCloseForm}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:rotate-90 duration-300"
            >
              <i className="fa-solid fa-times text-gray-600 text-lg"></i>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Company Logo Upload */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                <i className="fa-solid fa-image mr-2 text-purple-600"></i>
                Logo de l'entreprise
              </label>
              
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-lg">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="fa-solid fa-building text-5xl text-purple-300"></i>
                    )}
                  </div>
                  
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                    >
                      <i className="fa-solid fa-times text-sm"></i>
                    </button>
                  )}
                </div>

                <label 
                  htmlFor="image-upload"
                  className="cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md flex items-center gap-2"
                >
                  <i className="fa-solid fa-upload"></i>
                  {imagePreview ? 'Changer le logo' : 'Télécharger un logo'}
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG, GIF ou WebP (Max 5MB)
                </p>
              </div>
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-building mr-2 text-purple-600"></i>
                Nom de l'entreprise <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom_entreprise"
                value={formData.nom_entreprise}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ex: TechnoPlus SARL"
              />
            </div>

            {/* Business Sector */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-industry mr-2 text-purple-600"></i>
                Secteur d'activité <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="secteur_activite"
                value={formData.secteur_activite}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ex: Technologie, Construction, Marketing..."
              />
            </div>

            {/* Responsible */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-user-tie mr-2 text-purple-600"></i>
                Responsable <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ex: Ahmed Benali"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-map-marker-alt mr-2 text-purple-600"></i>
                Localisation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="localisation"
                value={formData.localisation}
                required
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ex: Casablanca, Rabat..."
              />
            </div>

            {/* Phone 1 */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-phone mr-2 text-purple-600"></i>
                Téléphone 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone1"
                value={formData.phone1}
                required
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="+212 5XX XXX XXX"
              />
            </div>

            {/* Phone 2 */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-phone mr-2 text-purple-600"></i>
                Téléphone 2
              </label>
              <input
                type="tel"
                name="phone2"
                value={formData.phone2}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="+212 5XX XXX XXX"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-envelope mr-2 text-purple-600"></i>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="contact@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-lock mr-2 text-purple-600"></i>
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder='Minimum 8 caractères'
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors">
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Subscription */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-crown mr-2 text-purple-600"></i>
                Abonnement 
              </label>
              <select
                name="abonnement"
                value={formData.abonnement}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {abonnement.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.type}
                    </option>
                  ))}
              </select>
            </div>

            

            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-star mr-2 text-purple-600"></i>
                Note
              </label>
              <select
                name="ranking"
                value={formData.ranking}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="5">5 ⭐⭐⭐⭐⭐</option>
                <option value="4">4 ⭐⭐⭐⭐</option>
                <option value="3">3 ⭐⭐⭐</option>
                <option value="2">2 ⭐⭐</option>
                <option value="1">1 ⭐</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-circle-check mr-2 text-purple-600"></i>
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>

            {/* Contract */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-file-signature mr-2 text-purple-600"></i>
                Contrat <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="contrat"
                required
                accept="image/*"
                onChange={e => setContract(e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseForm}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                <i className="fa-solid fa-times mr-2"></i>
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                    Envoi...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check mr-2"></i>
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 pr-0 sm:pr-32">
        <h1 className="text-xl sm:text-2xl font-semibold">Espace Gestion entreprises !</h1>
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
            placeholder="Recherche par secteur"
            className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm placeholder-white/70"
          />
        </div>

        <div className="flex-1 min-w-0 bg-[rgba(108,148,223,0.5)] backdrop-blur-md px-5 py-3 rounded-full flex items-center gap-3 border border-white/20">
          <i className="fa-solid fa-magnifying-glass text-white"></i>
          <input
            type="text"
            value={searchEntreprise}
            onChange={(e) => setSearchEntreprise(e.target.value)}
            placeholder="Recherche par entreprise"
            className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm placeholder-white/70"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[rgba(108,148,223,0.5)] backdrop-blur-md px-5 py-3 rounded-full border border-white/20 text-white text-xs sm:text-sm outline-none cursor-pointer min-w-[150px]"
        >
          <option value="all" className="bg-purple-700">Tous</option>
        <option value="active" className="bg-purple-700">Disponible</option>
          <option value="inactive" className="bg-purple-700">Occupé</option>
        </select>

        <button 
          onClick={handleAddEntreprise}
          className="bg-[rgba(108,148,223,0.6)] backdrop-blur-md px-6 py-3 rounded-full border border-white/30 text-white font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[rgba(108,148,223,0.8)] hover:-translate-y-1 text-xs sm:text-sm whitespace-nowrap"
        >
          <i className="fa-solid fa-building"></i>
          <span className="hidden sm:inline">Ajouter entreprise</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 animate-fadeInUp">
        {filteredEntreprises.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/70 text-sm sm:text-base">
            <i className="fa-solid fa-search text-4xl mb-4 opacity-50"></i>
            <p>Aucune entreprise trouvée</p>
          </div>
        ) : (
          paginatedEntreprises.map((entreprise) => (
            <div
              key={entreprise.id}
              className={`backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative transition-all duration-400 border-2 border-white/20 shadow-xl hover:-translate-y-2 hover:shadow-2xl ${
                entreprise.type_abonnement === 'Premium' 
                  ? 'bg-gradient-to-br from-pink-500/40 to-pink-600/40'
                  : 'bg-gradient-to-br from-[rgba(108,148,223,0.4)] to-[rgba(88,118,183,0.4)]'
              }`}
            >
              <span 
                className={`absolute top-4 sm:top-5 right-4 sm:right-5 w-3.5 h-3.5 rounded-full animate-pulse ${
                  entreprise.status === 'active' 
                    ? 'bg-green-500 shadow-[0_0_12px_#3b82f6]' 
                    : 'bg-[#ff4757] shadow-[0_0_12px_#ff4757]'
                }`}
              ></span>

              <div className="flex gap-1 mb-4 justify-center">
                {renderStars(entreprise.rating)}
              </div>

              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto mb-4 bg-white/10 flex items-center justify-center border-3 border-white/30 overflow-hidden">
                {entreprise.logo ? (
                  <img
                  src={`https://backend-production-36f5.up.railway.app/${entreprise.logo}`} 
                    alt={entreprise.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="fa-solid fa-building text-4xl sm:text-5xl text-white/50"></i>
                )}
              </div>

              <div className="text-center mb-5">
                <div className="text-base sm:text-xl font-semibold mb-4 text-white">
                  {entreprise.nom}
                </div>
                <div className="text-xs sm:text-sm leading-relaxed opacity-90 space-y-1">
                  <div>
                    <strong>Secteur d'activité :</strong> {entreprise.secteur}
                  </div>
                  <div>
                    <strong>Responsable :</strong> {entreprise.responsable}
                  </div>
                  <div>
                    <strong>Localisation :</strong> {entreprise.location}
                  </div>
                  
                  
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3 justify-center bg-white/10 p-3 rounded-full">
                <Link
                  to={`/entreprise/${entreprise.id}`}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-pink-500 text-white flex items-center justify-center transition-all hover:bg-[#d4507a] hover:scale-110"
                  title="Voir profil"
                >
                  <i className="fa-solid fa-eye text-sm sm:text-base"></i>
                </Link>

                <button
                  onClick={() => setSelectedEntreprise(entreprise)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-orange-500 text-white flex items-center justify-center transition-all hover:bg-[#d63447] hover:scale-110"
                  title="Plus d'options"
                >
                  <i className="fa-solid fa-edit text-sm sm:text-base"></i>
                </button>

                <button
                  onClick={() => handleDelete(entreprise.id)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-red-500 text-white flex items-center justify-center transition-all hover:bg-red-600 hover:scale-110"
                  title="Supprimer"
                >
                  <i className="fa-solid fa-trash text-white text-sm"></i>
                </button>
                <a 
                  href={`tel:${entreprise.phone1}`}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-green-500 text-white flex items-center justify-center transition-all hover:bg-green-600 hover:scale-110"
                  title="Appeler">
                  <i className="fa-solid fa-phone text-sm sm:text-base"></i>
                </a>
              </div>
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
      {filteredEntreprises.length > 0 && (
        <p className="text-center text-white/40 text-xs mt-3">
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredEntreprises.length)} sur {filteredEntreprises.length} Entreprises
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

        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        @keyframes pulse {
          0%, 100% { 
            opacity: 1; 
          }
          50% { 
            opacity: 0.5; 
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease;
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
      <SidePopup
        message={message}
        type="success"
        show={showPopup}
        onClose={() => setShowPopup(false)}
      />

      <EditEntreprise
  entreprise={selectedEntreprise}
  isOpen={selectedEntreprise !== null}
  onClose={() => setSelectedEntreprise(null)}
  onUpdate={() => {
    setSelectedEntreprise(null)
    fetchEntreprises()
    setShowPopup(true)
    setMessage("✅ L'entreprise a été mise à jour avec succès !")
  }}
/>

    </div>
  );
};

export default Entreprise;
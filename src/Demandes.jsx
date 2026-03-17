import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api/axios';
import SidePopup from './SidePopup';
import EditDemande from './EditDemande';

const Demandes = () => {
  const [searchSpeciality, setSearchSpeciality] = useState('');
  const [searchEntreprise, setSearchEntreprise] = useState('');
  const [entreprisesData, setEntreprisesData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [demandesData, setDemandesData] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [formData, setFormData] = useState({entreprise: '',poste: '',competences_requises: [''],nombre_postes: 1,salaire_min: '',salaire_max: '',type_contrat: 'CDI',description: '',date_entretien: '',lieu_entretien: '',status: 'attent'});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDemandes();
    fetchEntreprises();
  }, []);

  const fetchDemandes = () => {
    api.get('/demandes')
      .then(res => {
        setDemandesData(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const fetchEntreprises = () => {
    api.get('/activeentreprises')
      .then(res => {
        setEntreprisesData(res.data);
      })
      .catch(err => {
        console.error(err);
      });
  };

  const filteredDemandes = demandesData.filter(demande => {
    const entrepriseMatch = demande.nom.toLowerCase().includes(searchEntreprise.toLowerCase());
    const specialityMatch = demande.poste.toLowerCase().includes(searchSpeciality.toLowerCase());
    const statusMatch = statusFilter === 'all' || demande.status === statusFilter;
    return entrepriseMatch && specialityMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredDemandes.length / ITEMS_PER_PAGE);
    const paginatedDemandes = filteredDemandes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => { setCurrentPage(1); }, [searchSpeciality, searchEntreprise, statusFilter]);

  const handleAddDemande = () => {
    setShowAddForm(true);
    setFormData({
      entreprise: '',
      poste: '',
      competences_requises: [''],
      nombre_postes: 1,
      salaire_min: '',
      salaire_max: '',
      type_contrat: 'CDI',
      description: '',
      date_entretien: '',
      lieu_entretien: '',
      status: 'attent'
    });
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleAddSkill = () => {
    setFormData(prev => ({
      ...prev,
      competences_requises: [...prev.competences_requises, '']
    }));
  };
  const handleRemoveSkill = (index) => {
    const newSkills = formData.competences_requises.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      competences_requises: newSkills.length > 0 ? newSkills : ['']
    }));
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...formData.competences_requises];
    newSkills[index] = value;
    setFormData(prev => ({
      ...prev,
      competences_requises: newSkills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const skills = formData.competences_requises
        .filter(skill => skill.trim() !== '')
        .join(', ');

      const dataToSubmit = {
        ...formData,
        competences_requises: skills
      };

      const response = await api.post('/demandes', dataToSubmit);
      if (response.data) {
        setShowAddForm(false);
        fetchDemandes();
        setShowPopup(true);
        setMessage("Demande ajouté avec succès !")

        setFormData({
          entreprise: '',
          poste: '',
          competences_requises: [''],
          nombre_postes: 1,
          salaire_min: '',
          salaire_max: '',
          type_contrat: 'CDI',
          description: '',
          date_entretien: '',
          lieu_entretien: '',
          status: 'attent'
        });
      }
     
    } catch (error) {
      console.error('Error adding demande:', error);
      alert('❌ Erreur lors de l\'ajout de la demande');
    } finally {
      setIsSubmitting(false);
    }
    
  };

  const handleTraiter = async (id) => {
  try {
    await api.put(`/status/${id}`, { status: 'Traité' });
    fetchDemandes();
    setShowPopup(true);
    setMessage("✅ La demande a été traitée avec succès !");
  } catch (error) {
    console.error('Error updating demande:', error);
    alert("❌ Erreur lors de la mise à jour du statut.");
  }
};

const handleRefuser = async (id) => {
  try {
    await api.put(`/status/${id}`, { status: 'Refusé' });
    fetchDemandes();
    setShowPopup(true);
    setMessage("✅ La demande a été refusée avec succès !");
  } catch (error) {
    console.error('Error updating demande:', error);
    alert("❌ Erreur lors de la mise à jour du statut.");
  }
};


  const getLogoGradient = (index) => {
    const gradients = [
      'bg-gradient-to-br from-purple-500 to-purple-700',
      'bg-gradient-to-br from-blue-400 to-cyan-400',
      'bg-gradient-to-br from-pink-500 to-yellow-400',
      'bg-gradient-to-br from-green-400 to-blue-500',
      'bg-gradient-to-br from-red-400 to-pink-500',
      'bg-gradient-to-br from-yellow-400 to-orange-500'
    ];
    return gradients[index % gradients.length];
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  function handleUpdate(e){
    setSelectedDemande(e)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette DEMANDE ?")) {
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
              <i className="fa-solid fa-file-alt mr-2"></i>
              Ajouter une nouvelle demande
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
            {/* Company */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-building mr-2 text-purple-600"></i>
                Entreprise <span className="text-red-500">*</span>
              </label>

              {entreprisesData ? <div className="relative">
                <select 
                  name="entreprise"
                  value={formData.entreprise} 
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl bg-white text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 transition-all cursor-pointer"
                >
                  <option value="">-- Choisir la société --</option>
                  {entreprisesData.map((item, index) => (
                    <option key={index} value={item.id}>
                      {item.nom}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-purple-600">
                  <i className="fa-solid fa-chevron-down text-sm"></i>
                </div>
              </div>:null}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-briefcase mr-2 text-purple-600"></i>
                Poste <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="poste"
                value={formData.poste}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ex: Développeur Full Stack"
              />
            </div>

            {/* Required Skills - Multiple Inputs */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-star mr-2 text-purple-600"></i>
                Compétences requises <span className="text-red-500">*</span>
              </label>
              
              <div className="space-y-3">
                {formData.competences_requises.map((skill, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder={`Ex: ${index === 0 ? 'PHP' : index === 1 ? 'Laravel' : 'React'}`}
                      required={index === 0}
                    />
                    
                    {formData.competences_requises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                        title="Supprimer"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="w-full px-4 py-3 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i>
                  Ajouter une compétence
                </button>
              </div>
              
              {/* Preview of skills */}
              {formData.competences_requises.some(s => s.trim()) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.competences_requises
                      .filter(skill => skill.trim() !== '')
                      .map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Number of Positions */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-users mr-2 text-purple-600"></i>
                Nombre de postes <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="nombre_postes"
                value={formData.nombre_postes}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-money-bill mr-2 text-purple-600"></i>
                Fourchette salariale <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="salaire_min"
                  value={formData.salaire_min}
                  onChange={handleInputChange}
                  placeholder="Min (DH)"
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  name="salaire_max"
                  value={formData.salaire_max}
                  onChange={handleInputChange}
                  placeholder="Max (DH)"
                  required
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Contract Type */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-file-contract mr-2 text-purple-600"></i>
                Type de contrat <span className="text-red-500">*</span>
              </label>
              <select
                name="type_contrat"
                value={formData.type_contrat}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-align-left mr-2 text-purple-600"></i>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Description du poste..."
              ></textarea>
            </div>

            {/* Interview Date */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-calendar mr-2 text-purple-600"></i>
                Date d'entretien <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date_entretien"
                value={formData.date_entretien}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Interview Location */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-map-marker-alt mr-2 text-purple-600"></i>
                Lieu d'entretien <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lieu_entretien"
                value={formData.lieu_entretien}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ex: Casablanca, Centre ville"
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
        <h1 className="text-xl sm:text-2xl font-semibold">Espace Demandes !</h1>
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
          <option value="attent" className="bg-purple-700">En attente</option>
          <option value="Refusé" className="bg-purple-700">Refusé</option>
        </select>

        <button 
          onClick={handleAddDemande}
          className="bg-[rgba(108,148,223,0.6)] backdrop-blur-md px-6 py-3 rounded-full border border-white/30 text-white font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[rgba(108,148,223,0.8)] hover:-translate-y-1 text-xs sm:text-sm whitespace-nowrap"
        >
          <i className="fa-solid fa-user-plus"></i>
          <span className="hidden sm:inline">Ajouter Demande</span>
          <span className="sm:hidden">Ajouter</span>
        </button>

        
      </div>

      {/* Demandes Grid */}
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
<button
  onClick={() => handleUpdate(demande)}
  className="absolute top-1 sm:top-1 left-4 sm:left-5 w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(147,51,234,0.5)]"
  title="Modifier"
>
  <i className="fa-solid fa-pen text-white text-sm"></i>
</button>
<button
  onClick={() => handleDelete(demande.id)}
  className="absolute top-12 sm:top-12 left-4 sm:left-5 w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(239,68,68,0.5)]"
  title="Supprimer"
>
  <i className="fa-solid fa-trash text-white text-sm"></i>
</button>

<Link
  to={`/demandes/${demande.id}`}
  state={{ fromApp: true }}
  className="absolute top-24 sm:top-24 left-4 sm:left-5 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(59,130,246,0.5)]"
  title="Voir"
>
  <i className="fa-solid fa-eye text-white text-sm"></i>
</Link>

              <div className={`w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 ${getLogoGradient(index)} rounded-2xl flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl`}>
                {getInitials(demande.nom)}
              </div>

              <div className="text-center mb-5">
                <div className="text-base sm:text-lg font-semibold mb-4 text-white">
                  {demande.nom}
                </div>
                <div className="text-xs sm:text-sm leading-relaxed space-y-1.5">
                  <div className="flex gap-2">
                    <strong className="min-w-[140px] opacity-90">Poste :</strong>
                    <span>{demande.poste}</span>
                  </div>
                  <div className="flex gap-2">
                    <strong className="min-w-[140px] opacity-90">Compétences :</strong>
                    <span>{demande.competence}</span>
                  </div>
                  <div className="flex gap-2">
                    <strong className="min-w-[140px] opacity-90">Nb postes :</strong>
                    <span>{demande.NumPostes} poste(s)</span>
                  </div>
                  <div className="flex gap-2">
                    <strong className="min-w-[140px] opacity-90">Salaire :</strong>
                    <span>{demande.min}-{demande.max} DH</span>
                  </div>
                  <div className="flex gap-2">
                    <strong className="min-w-[140px] opacity-90">Contrat :</strong>
                    <span>{demande.contrat}</span>
                  </div>
                  <div className="flex gap-2">
                    <strong className="min-w-[140px] opacity-90">Description :</strong>
<span>
  {demande.description?.slice(0, 10)}
  {demande.description?.length > 10 && "..."}
</span>                  </div>
                  <div className="flex gap-2">
                    <strong className="min-w-[140px] opacity-90">Date entretien :</strong>
<span>
  {new Date(demande.dateEntretien).toISOString().split("T")[0]}
</span>
                  </div>
                  <div className="flex gap-2">
                    <strong className="min-w-[140px] opacity-90">Lieu :</strong>
                    <span>{demande.localEntretien}</span>
                  </div>
                </div>
              </div>

             {demande.status === "attent" ? (
  <div className="flex gap-3 mt-5">
    <button
      onClick={() => handleTraiter(demande.id)}
      className="flex-1 px-5 py-3 bg-[#00d47e] text-white rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#00a861] hover:-translate-y-1 hover:shadow-lg"
    >
      <i className="fa-solid fa-check"></i>
      <span>Traiter</span>
    </button>

    <button
      onClick={() => handleRefuser(demande.id)}
      className="flex-1 px-5 py-3 bg-[#ff4757] text-white rounded-full font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#d63447] hover:-translate-y-1 hover:shadow-lg"
    >
      <i className="fa-solid fa-xmark"></i>
      <span>Refuser</span>
    </button>
  </div>
): demande.status === "Refusé" ? (
  <div className="mt-5 px-5 py-3 bg-[#ff4757] bg-opacity-20 border-2 border-[#ff4757] rounded-full text-center">
    <div className="flex items-center justify-center gap-2 text-[#ff4757] font-semibold">
      <i className="fa-solid fa-circle-xmark text-lg"></i>
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
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredDemandes.length)} sur {filteredDemandes.length} Demandes
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

              <EditDemande
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

export default Demandes;
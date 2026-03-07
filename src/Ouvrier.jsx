import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api/axios';
import SidePopup from './SidePopup';
import EditOuvrier from './EditOuvrier';

// ── Outside component to prevent remount on every render ──
const DynamicListField = ({ field, label, icon, placeholder, tagColor, items, onChange, onAdd, onRemove }) => (
  <div>
    <label className="block text-sm font-semibold mb-2 text-gray-700">
      <i className={`${icon} mr-2 text-purple-600`} />
      {label}
    </label>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={e => onChange(index, e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder={placeholder(index)}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all"
            >
              <i className="fa-solid fa-trash" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="w-full px-4 py-3 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
      >
        <i className="fa-solid fa-plus" />
        Ajouter
      </button>
    </div>
    {items.some(v => v.trim()) && (
      <div className="mt-3 p-3 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-500 mb-2">Aperçu :</p>
        <div className="flex flex-wrap gap-2">
          {items.filter(v => v.trim()).map((v, i) => (
            <span key={i} className={`px-3 py-1 ${tagColor} rounded-full text-sm font-medium`}>{v}</span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const Ouvrier = () => {
  const [searchSpeciality, setSearchSpeciality] = useState('');
  const [searchWorker, setSearchWorker] = useState('');
  const [workersData, setWorkersData] = useState([]);
  const [selectedOuvrier, setSelectedOuvrier] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [formData, setFormData] = useState({
    nom_complet: '',
    specialite: '',
    experience: '',
    localisation: '',
    ranking: 5,
    phone: '',
    email: '',
    status: 'available',
    languages: [''],
    competences: [''],
    education: [''],
  });

  useEffect(() => { fetchWorkers(); }, []);

  const fetchWorkers = () => {
    api.get('/ouvriers')
      .then(res => setWorkersData(res.data))
      .catch(err => console.error(err));
  };

  const filteredWorkers = workersData.filter(worker => {
    const specialityMatch = worker.specialite.toLowerCase().includes(searchSpeciality.toLowerCase());
    const statusMatch = statusFilter === 'all' || worker.status === statusFilter;
    const nameMatch = worker.nom_complet.toLowerCase().includes(searchWorker.toLowerCase());
    return specialityMatch && nameMatch && statusMatch;
  });

  // ── Dynamic array handlers ───────────────────────────
  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleAddArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const handleRemoveArrayItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  // ── Other handlers ───────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddWorker = () => {
    setShowAddForm(true);
    setFormData({
      nom_complet: '', specialite: '', experience: '', localisation: '',
      ranking: 5, phone: '', email: '', status: 'available',
      languages: [''], competences: [''], education: [''],
    });
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('❌ Veuillez sélectionner une image valide'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('❌ La taille de l\'image ne doit pas dépasser 5MB'); return; }
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      const val = formData[key];
      if (Array.isArray(val)) {
        form.append(key, val.filter(v => v.trim()).join(','));
      } else {
        form.append(key, val);
      }
    });
    if (photo) form.append('photo', photo);
    try {
      await api.post('/ouvriers', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowAddForm(false);
      fetchWorkers();
      setPhoto(null);
      setPhotoPreview(null);
      setMessage("✅ L'ouvrier a été ajouté avec succès !");
      setShowPopup(true);
    } catch (error) {
      if (error.response?.status === 400) {
        const { message, field } = error.response.data;
        setMessage(`❌ ${message}`);
        setShowPopup(true);
        const fieldInput = document.querySelector(`input[name="${field}"]`);
        if (fieldInput) {
          fieldInput.classList.add('border-red-500', 'ring-2', 'ring-red-500');
          fieldInput.focus();
          setTimeout(() => fieldInput.classList.remove('border-red-500', 'ring-2', 'ring-red-500'), 3000);
        }
      } else {
        setMessage("❌ Erreur lors de l'ajout");
        setShowPopup(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet OUVRIER ?')) return;
    try {
      await api.delete(`/ouvrier/${id}`);
      fetchWorkers();
      setShowPopup(true);
      setMessage("✅ L'ouvrier a été supprimé avec succès !");
    } catch (error) {
      console.error('Error deleting ouvrier:', error);
      alert('❌ Erreur lors de la suppression.');
    }
  };

  const totalPages = Math.ceil(filteredWorkers.length / ITEMS_PER_PAGE);
  const paginatedWorkers = filteredWorkers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
useEffect(() => { setCurrentPage(1); }, [searchSpeciality, searchWorker, statusFilter]);

  const renderStars = (rating) =>
    [...Array(5)].map((_, index) => (
      <i key={index} className={`fa-solid fa-star ${index < rating ? 'text-yellow-400' : 'text-gray-400'}`} />
    ));

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-t from-purple-600 to-purple-700 text-white p-4 sm:p-6 lg:p-8">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={handleCloseForm} />
      )}

      {/* Slide-in Form Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white text-gray-800 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out overflow-y-auto ${showAddForm ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-700">
              <i className="fa-solid fa-user-plus mr-2" />
              Ajouter un ouvrier
            </h2>
            <button onClick={handleCloseForm} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:rotate-90 duration-300">
              <i className="fa-solid fa-times text-gray-600 text-lg" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                <i className="fa-solid fa-camera mr-2 text-purple-600" />
                Photo de profil
              </label>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  <div className="w-full h-full rounded-full border-4 border-purple-200 overflow-hidden bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-lg">
                    {photoPreview
                      ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      : <i className="fa-solid fa-user text-6xl text-purple-300" />}
                  </div>
                  {photoPreview && (
                    <button type="button" onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg">
                      <i className="fa-solid fa-times text-sm" />
                    </button>
                  )}
                </div>
                <label htmlFor="image-upload" className="cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg flex items-center gap-2">
                  <i className="fa-solid fa-upload" />
                  {photoPreview ? 'Changer la photo' : 'Télécharger une photo'}
                </label>
                <input id="image-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <p className="text-xs text-gray-500 mt-2">JPG, PNG ou GIF (max. 5MB)</p>
              </div>
            </div>

            {/* Nom complet */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-user mr-2 text-purple-600" />
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input type="text" name="nom_complet" value={formData.nom_complet} onChange={handleInputChange} required className={inputClass} placeholder="Ex: Ahmed Benali" />
            </div>

            {/* Spécialité */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-briefcase mr-2 text-purple-600" />
                Spécialité <span className="text-red-500">*</span>
              </label>
              <input type="text" name="specialite" value={formData.specialite} onChange={handleInputChange} required className={inputClass} placeholder="Ex: Plomberie, Électricien..." />
            </div>

            {/* Expérience */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-clock mr-2 text-purple-600" />
                Expérience <span className="text-red-500">*</span>
              </label>
              <input type="text" name="experience" required value={formData.experience} onChange={handleInputChange} className={inputClass} placeholder="Ex: 3 ans, 6 mois..." />
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
              <i className="fa-solid fa-map-marker-alt mr-2 text-purple-600" />
                Localisation <span className="text-red-500">*</span>
              </label>
              <input type="text" required name="localisation" value={formData.localisation} onChange={handleInputChange} className={inputClass} placeholder="Ex: Casablanca, Rabat..." />
            </div>
            {/* Téléphone */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-phone mr-2 text-purple-600" />
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="+212 6XX XXX XXX" />
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-envelope mr-2 text-purple-600" />
                Email <span className="text-red-500">*</span>
              </label>
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="example@email.com" />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-star mr-2 text-purple-600" />
                Note
              </label>
              <select name="ranking" value={formData.ranking} onChange={handleInputChange} className={inputClass}>
                <option value="5">5 ⭐⭐⭐⭐⭐</option>
                <option value="4">4 ⭐⭐⭐⭐</option>
                <option value="3">3 ⭐⭐⭐</option>
                <option value="2">2 ⭐⭐</option>
                <option value="1">1 ⭐</option>
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-circle-check mr-2 text-purple-600" />
                Statut
              </label>
              <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass}>
                <option value="available">Disponible</option>
                <option value="busy">Occupé</option>
              </select>
            </div>

            {/* Langues */}
            <DynamicListField
              field="languages"
              label="Langues"
              icon="fa-solid fa-language"
              placeholder={i => ['Français', 'Anglais', 'Arabe'][i] ?? 'Langue'}
              tagColor="bg-purple-100 text-purple-700"
              items={formData.languages}
              onChange={(index, val) => handleArrayChange('languages', index, val)}
              onAdd={() => handleAddArrayItem('languages')}
              onRemove={index => handleRemoveArrayItem('languages', index)}
            />

            {/* Compétences */}
            <DynamicListField
              field="competences"
              label="Compétences"
              icon="fa-solid fa-tasks"
              placeholder={i => ['Plomberie', 'Électricité', 'Menuiserie'][i] ?? 'Compétence'}
              tagColor="bg-blue-100 text-blue-700"
              items={formData.competences}
              onChange={(index, val) => handleArrayChange('competences', index, val)}
              onAdd={() => handleAddArrayItem('competences')}
              onRemove={index => handleRemoveArrayItem('competences', index)}
            />

            {/* Formation */}
            <DynamicListField
              field="education"
              label="Formation / Éducation"
              icon="fa-solid fa-graduation-cap"
              placeholder={i => ['Baccalauréat', 'Licence en...', 'Master en...'][i] ?? 'Formation'}
              tagColor="bg-green-100 text-green-700"
              items={formData.education}
              onChange={(index, val) => handleArrayChange('education', index, val)}
              onAdd={() => handleAddArrayItem('education')}
              onRemove={index => handleRemoveArrayItem('education', index)}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleCloseForm} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all">
                <i className="fa-solid fa-times mr-2" />Annuler
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {isSubmitting
                  ? <><i className="fa-solid fa-spinner fa-spin mr-2" />Envoi...</>
                  : <><i className="fa-solid fa-check mr-2" />Enregistrer</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 pr-0 sm:pr-32">
        <h1 className="text-xl sm:text-2xl font-semibold">Espace Gestion ouvriers !</h1>
        <Link to="/" className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/25 text-white font-medium flex items-center gap-2 transition-all hover:bg-white/30 text-xs sm:text-sm">
          <i className="fa-solid fa-house" />
          <span>Retour à l'accueil</span>
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0 bg-[rgba(108,148,223,0.5)] backdrop-blur-md px-5 py-3 rounded-full flex items-center gap-3 border border-white/20">
          <i className="fa-solid fa-magnifying-glass text-white" />
          <input type="text" value={searchSpeciality} onChange={e => setSearchSpeciality(e.target.value)} placeholder="Recherche par spécialité" className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm placeholder-white/70" />
        </div>
        <div className="flex-1 min-w-0 bg-[rgba(108,148,223,0.5)] backdrop-blur-md px-5 py-3 rounded-full flex items-center gap-3 border border-white/20">
          <i className="fa-solid fa-magnifying-glass text-white" />
          <input type="text" value={searchWorker} onChange={e => setSearchWorker(e.target.value)} placeholder="Recherche par ouvrier" className="flex-1 bg-transparent border-none outline-none text-white text-xs sm:text-sm placeholder-white/70" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[rgba(108,148,223,0.5)] backdrop-blur-md px-5 py-3 rounded-full border border-white/20 text-white text-xs sm:text-sm outline-none cursor-pointer min-w-[150px]">
          <option value="all" className="bg-purple-700">Tous</option>
          <option value="available" className="bg-purple-700">Disponible</option>
          <option value="busy" className="bg-purple-700">Occupé</option>
        </select>
        <button onClick={handleAddWorker} className="bg-[rgba(108,148,223,0.6)] backdrop-blur-md px-6 py-3 rounded-full border border-white/30 text-white font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[rgba(108,148,223,0.8)] hover:-translate-y-1 text-xs sm:text-sm whitespace-nowrap">
          <i className="fa-solid fa-user-plus" />
          <span className="hidden sm:inline">Ajouter ouvrier</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 animate-fadeInUp">
        {filteredWorkers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/70 text-sm sm:text-base">
            <i className="fa-solid fa-search text-4xl mb-4 opacity-50 block" />
            <p>Aucun ouvrier trouvé</p>
          </div>
        ) : (
          paginatedWorkers.map(worker => (
            <div key={worker.id} className="bg-purple-600 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 relative transition-all duration-400 border border-white/15 shadow-xl hover:-translate-y-2 hover:shadow-2xl">
              <span className={`absolute top-4 sm:top-5 right-4 sm:right-5 w-3 h-3 rounded-full animate-pulse ${worker.status === 'available' ? 'bg-[#00ff88] shadow-[0_0_10px_#00ff88]' : 'bg-[#ff4757] shadow-[0_0_10px_#ff4757]'}`} />
              <div className="flex gap-1 mb-4 justify-center">{renderStars(worker.ranking)}</div>
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full mx-auto mb-4 bg-white/10 flex items-center justify-center border-3 border-white/30 overflow-hidden">
              {worker.photo ? (
              <img
                src={`http://localhost:5000/${worker.photo}`}
                alt={worker.nom_complet}
                className="w-full h-full object-cover"
                />
                ) : (
                <i className="fa-solid fa-user text-4xl sm:text-5xl text-white/50" />
                )}
                  </div>
              <div className="text-center mb-5">
                <div className="text-base sm:text-lg font-semibold mb-3 text-white capitalize">{worker.nom_complet}</div>
                <div className="text-xs sm:text-sm leading-relaxed opacity-90 space-y-1">
                  <div><strong>Spécialité :</strong> {worker.specialite}</div>
                  <div><strong>Expérience :</strong> {worker.experience}</div>
                  <div><strong>Localisation :</strong> {worker.localisation}</div>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 justify-center bg-white/10 p-3 rounded-full">
                <Link to={`/ouvriers/${worker.id}`} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-pink-500 text-white flex items-center justify-center transition-all hover:bg-[#d4507a] hover:scale-110" title="Voir profil">
                  <i className="fa-solid fa-eye text-sm sm:text-base" />
                </Link>
                <button onClick={() => setSelectedOuvrier(worker)} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-orange-500 text-white flex items-center justify-center transition-all hover:bg-[#d63447] hover:scale-110 border-0 cursor-pointer" title="Modifier">
                  <i className="fa-solid fa-edit text-sm sm:text-base" />
                </button>
                <button onClick={() => handleDelete(worker.id)} className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-red-500 text-white flex items-center justify-center transition-all hover:bg-red-600 hover:scale-110 border-0 cursor-pointer" title="Supprimer">
                  <i className="fa-solid fa-trash text-sm" />
                </button>
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
      {filteredWorkers.length > 0 && (
        <p className="text-center text-white/40 text-xs mt-3">
          {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredWorkers.length)} sur {filteredWorkers.length} ouvriers
        </p>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease; }
      `}</style>

      <SidePopup message={message} type="success" show={showPopup} onClose={() => setShowPopup(false)} />
      <EditOuvrier
        ouvrier={selectedOuvrier}
        isOpen={selectedOuvrier !== null}
        onClose={() => setSelectedOuvrier(null)}
        onUpdate={async (id, formData) => {
          await api.put(`/ouvrier/${id}`, formData,{
  headers: { 'Content-Type': 'multipart/form-data' }});
          setSelectedOuvrier(null);
          fetchWorkers();
          setShowPopup(true);
          setMessage("✅ L'ouvrier a été mis à jour avec succès !");
        }}
      />
    </div>
  );
};

export default Ouvrier;
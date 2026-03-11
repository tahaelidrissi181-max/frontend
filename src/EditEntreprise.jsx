import { useState, useEffect } from 'react'
import api from './api/axios'
import SidePopup from './SidePopup'

const EditEntreprise = ({ entreprise, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    nom_entreprise: '',
    secteur_activite: '',
    responsable: '',
    localisation: '',
    phone1: '',
    phone2: '',
    email: '',
    abonnement: 1,
    ranking: '5',
    status: 'active',
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [contract, setContract] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [abonnement, setAbonnement] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAbonnement()
    if (!entreprise || !isOpen) return
    setFormData({
      nom_entreprise: entreprise.nom ?? '',
      secteur_activite: entreprise.secteur ?? '',
      responsable: entreprise.responsable ?? '',
      localisation: entreprise.location ?? '',
      phone1: entreprise.phone1 ?? '',
      phone2: entreprise.phone2 ?? '',
      email: entreprise.email ?? '',
      abonnement: entreprise.abonnementID ?? 1,
      ranking: entreprise.rating?.toString() ?? '5',
      status: entreprise.status ?? 'active',
    })
    setImagePreview(entreprise.logo || null)
    setImageFile(null)
    setContract(null)
    setFieldErrors({})
  }, [entreprise, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setImageFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v))
      if (imageFile instanceof File) payload.append('logo', imageFile, imageFile.name)
if (contract instanceof File) payload.append('contrat', contract, contract.name)


      await api.put(`/entreprise/${entreprise.id}`, payload ,{
  headers: { 'Content-Type': 'multipart/form-data' }}
      )

      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      if (error.response.status == 409) {
        console.error('Error updating ouvrier:', error.response.status)
        const { message, field } = error.response.data
        setMessage(`❌ ${message}`);
        setShowPopup(true);
        
        // Highlight the problematic field
        const fieldInput = document.querySelector(`input[name="${field}"]`)
        if (fieldInput) {
          fieldInput.classList.add('border-red-500', 'ring-2', 'ring-red-500')
          fieldInput.focus()
          setTimeout(() => {
            fieldInput.classList.remove('border-red-500', 'ring-2', 'ring-red-500')
          }, 3000)
        }
      } else {
        setMessage('❌ Erreur lors de la mise à jour');
        setShowPopup(true);
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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


  const inputClass = (field) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
      fieldErrors[field]
        ? 'border-red-400 focus:ring-red-400 bg-red-50'
        : 'border-gray-300 focus:ring-purple-500'
    }`


  return (
    <>
    <SidePopup 
        message={message} 
        type="success"
        show={showPopup} 
        onClose={() => setShowPopup(false)} 
      />
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white text-gray-800 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-700">
              <i className="fa-solid fa-pen mr-2"></i>
              Modifier l'entreprise
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:rotate-90 duration-300"
            >
              <i className="fa-solid fa-times text-gray-600 text-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">
                <i className="fa-solid fa-image mr-2 text-purple-600"></i>
                Logo de l'entreprise
              </label>
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-lg">
                    {imagePreview ? (
                      <img src={`https://backend-production-36f5.up.railway.app/${imagePreview}`}
 alt="Preview" className="w-full h-full object-cover" />
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
                  htmlFor="edit-logo-upload"
                  className="cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md flex items-center gap-2"
                >
                  <i className="fa-solid fa-upload"></i>
                  {imagePreview ? 'Changer le logo' : 'Télécharger un logo'}
                </label>
                <input
                  id="edit-logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF ou WebP (Max 5MB)</p>
              </div>
            </div>

            {/* Nom */}
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

            {/* Responsable */}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ex: Ahmed Benali"
                required

              />
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-map-marker-alt mr-2 text-purple-600"></i>
                Localisation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="localisation"
                value={formData.localisation}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ex: Casablanca, Rabat..."
                                required

              />
            </div>

            {/* Phone 1 */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-phone mr-2 text-purple-600"></i>
                Téléphone 1
              </label>
              <input
                type="tel"
                name="phone1"
                value={formData.phone1}
                onChange={handleInputChange}
                className={inputClass('phone1')}
                placeholder="+212 5XX XXX XXX"
              />
              {fieldErrors.phone1 && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-exclamation" />
                  {fieldErrors.phone1}
                </p>
              )}
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
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={inputClass('email')}
                placeholder="contact@company.com"
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-exclamation" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Abonnement */}
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
                  <option key={index} value={item.id}>{item.type}</option>
                ))}
              </select>
            </div>

            {/* Ranking */}
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

            {/* Contrat */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-file-signature mr-2 text-purple-600"></i>
                Contrat <span className="text-xs text-gray-400 font-normal ml-1">(laisser vide pour ne pas changer)</span>
              </label>
              <input
                type="file"
                name="contrat"
                accept="image/*"
                onChange={e => setContract(e.target.files[0])}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
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
                    Mise à jour...
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
    </>
  )
}

export default EditEntreprise
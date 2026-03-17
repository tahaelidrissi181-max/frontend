import { useState, useEffect } from 'react'
import SidePopup from './SidePopup'

const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"

// ── Outside component to prevent remount/focus loss ──
const DynamicListField = ({ label, icon, placeholder, tagColor, items, onChange, onAdd, onRemove }) => (
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
)

// Helper: DB comma string → array of strings
const toArray = (val) => {
  if (!val || val === '') return ['']
  const arr = val.split(',').map(v => v.trim()).filter(Boolean)
  return arr.length ? arr : ['']
}

// Helper: array → comma string for DB
const toStr = (arr) => arr.filter(v => v.trim()).join(',')

const EditOuvrier = ({ ouvrier, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    nom_complet: '',
    specialite: '',
    experience: '',
    localisation: '',
    phone: '',
    email: '',
    ranking: '5',
    status: 'available',
  })
  const [languages,    setLanguages]    = useState([''])
  const [competences,  setCompetences]  = useState([''])
  const [education,    setEducation]    = useState([''])
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile,    setPhotoFile]    = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!ouvrier || !isOpen) return
    setFormData({
      nom_complet: ouvrier.nom_complet  ?? '',
      specialite:  ouvrier.specialite   ?? '',
      experience:  ouvrier.experience   ?? '',
      localisation: ouvrier.localisation ?? '',
      phone:       ouvrier.phone        ?? '',
      email:       ouvrier.email        ?? '',
      ranking:     ouvrier.ranking?.toString() ?? '5',
      status:      ouvrier.status       ?? 'available',
    })
    setLanguages(toArray(ouvrier.langues))
    setCompetences(toArray(ouvrier.competence))
    setEducation(toArray(ouvrier.education))
    setPhotoPreview(ouvrier.photo || ouvrier.image || null)
    setPhotoFile(null)
  }, [ouvrier, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // ── Array field handlers ─────────────────────────────
  const makeHandlers = (setter) => ({
    onChange:  (index, val) => setter(prev => { const a = [...prev]; a[index] = val; return a }),
    onAdd:     ()           => setter(prev => [...prev, '']),
    onRemove:  (index)      => setter(prev => prev.filter((_, i) => i !== index)),
  })

  const langHandlers  = makeHandlers(setLanguages)
  const compHandlers  = makeHandlers(setCompetences)
  const eduHandlers   = makeHandlers(setEducation)

  // ── Photo ────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => { setPhotoPreview(null); setPhotoFile(null) }

  // ── Submit ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v))
      payload.append('langues',     toStr(languages))
      payload.append('competence',  toStr(competences))
      payload.append('education',   toStr(education))
      if (photoFile instanceof File) payload.append('photo', photoFile, photoFile.name)
      
      await onUpdate(ouvrier.id, payload)
      onClose()
    } catch (error) {
      // ✅ Show error message via SidePopup - NO ALERTS!
      if (error.response.status == 400) {
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

  return (
    <>
      <SidePopup 
        message={message} 
        type="success"
        show={showPopup} 
        onClose={() => setShowPopup(false)} 
      />

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300" onClick={onClose} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white text-gray-800 shadow-2xl z-50 transform transition-transform duration-500 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 sm:p-8">

          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-700">
              <i className="fa-solid fa-user-pen mr-2" />
              Modifier l'ouvrier
            </h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:rotate-90 duration-300">
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
                      ? <img src={photoPreview.startsWith('data:') 
      ? photoPreview 
      : `https://backend-production-36f5.up.railway.app/${photoPreview}`
    }
 alt="Preview" className="w-full h-full object-cover" />
                      : <i className="fa-solid fa-user text-6xl text-purple-300" />}
                  </div>
                  {photoPreview && (
                    <button type="button" onClick={handleRemovePhoto}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110">
                      <i className="fa-solid fa-times text-sm" />
                    </button>
                  )}
                </div>
                <label htmlFor="edit-image-upload" className="cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg flex items-center gap-2">
                  <i className="fa-solid fa-upload" />
                  {photoPreview ? 'Changer la photo' : 'Télécharger une photo'}
                </label>
                <input id="edit-image-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <p className="text-xs text-gray-500 mt-2 text-center">JPG, PNG ou GIF (max. 5MB)</p>
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
                Expérience
              </label>
              <input type="text" name="experience" value={formData.experience} onChange={handleInputChange} className={inputClass} placeholder="Ex: 3 ans, 6 mois..." />
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-map-marker-alt mr-2 text-purple-600" />
                Localisation
              </label>
              <input type="text" name="localisation" value={formData.localisation} onChange={handleInputChange} className={inputClass} placeholder="Ex: Casablanca, Rabat..." />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-phone mr-2 text-purple-600" />
                Téléphone
              </label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={inputClass} placeholder="+212 6XX XXX XXX" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-envelope mr-2 text-purple-600" />
                Email
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputClass} placeholder="example@email.com" />
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
              label="Langues"
              icon="fa-solid fa-language"
              placeholder={i => ['Français', 'Anglais', 'Arabe'][i] ?? 'Langue'}
              tagColor="bg-purple-100 text-purple-700"
              items={languages}
              {...langHandlers}
            />

            {/* Compétences */}
            <DynamicListField
              label="Compétences"
              icon="fa-solid fa-tasks"
              placeholder={i => ['Plomberie', 'Électricité', 'Menuiserie'][i] ?? 'Compétence'}
              tagColor="bg-blue-100 text-blue-700"
              items={competences}
              {...compHandlers}
            />

            {/* Formation */}
            <DynamicListField
              label="Formation / Éducation"
              icon="fa-solid fa-graduation-cap"
              placeholder={i => ['Baccalauréat', 'Licence en...', 'Master en...'][i] ?? 'Formation'}
              tagColor="bg-green-100 text-green-700"
              items={education}
              {...eduHandlers}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all">
                <i className="fa-solid fa-times mr-2" />Annuler
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {isSubmitting
                  ? <><i className="fa-solid fa-spinner fa-spin mr-2" />Mise à jour...</>
                  : <><i className="fa-solid fa-check mr-2" />Enregistrer</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default EditOuvrier
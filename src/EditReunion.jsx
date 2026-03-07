import React, { useState, useEffect } from 'react'
import api from './api/axios'

const EditReunion = ({ demande, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    poste: '',
    competences_requises: [''],
    nombre_postes: '',
    salaire_min: '',
    salaire_max: '',
    type_contrat: 'CDI',
    description: '',
    date_entretien: '',
    lieu_entretien: '',
    status: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!demande || !isOpen) return
    setFormData({
      poste: demande.poste ?? '',
      competences_requises: demande.competence
        ? demande.competence.split(',').map(s => s.trim())
        : [''],
      nombre_postes: demande.NumPostes ?? '',
      salaire_min: demande.min ?? '',
      salaire_max: demande.max ?? '',
      type_contrat: demande.contrat ?? 'CDI',
      description: demande.description ?? '',
      status: demande.status ?? '',
      date_entretien: demande.dateEntretien
        ? new Date(demande.dateEntretien).toISOString().split('T')[0]
        : '',
      lieu_entretien: demande.localEntretien ?? '',
    })
  }, [demande, isOpen])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSkillChange = (index, value) => {
    const updated = [...formData.competences_requises]
    updated[index] = value
    setFormData((prev) => ({ ...prev, competences_requises: updated }))
  }

  const handleAddSkill = () => {
    setFormData((prev) => ({
      ...prev,
      competences_requises: [...prev.competences_requises, ''],
    }))
  }

  const handleRemoveSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      competences_requises: prev.competences_requises.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      // ✅ Built inside handleSubmit so it always uses latest formData
      const skills = formData.competences_requises
        .filter(skill => skill.trim() !== '')
        .join(', ')

      const dataToSubmit = {
        ...formData,
        competences_requises: skills,
      }

      await api.put(`/demandes/${demande.id}`, dataToSubmit)

      // ✅ Call onUpdate so parent can refresh list + show popup
      if (onUpdate) onUpdate()
      onClose()
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
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
              Modifier la demande
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:rotate-90 duration-300"
            >
              <i className="fa-solid fa-times text-gray-600 text-lg"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {demande?.nom && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  <i className="fa-solid fa-building mr-2 text-purple-600"></i>
                  Entreprise
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
                  <span className="font-medium">{demande.nom}</span>
                  <span className="ml-auto text-xs text-gray-400 italic">non modifiable</span>
                </div>
              </div>
            )}

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
                      placeholder={`Compétence ${index + 1}`}
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
              {formData.competences_requises.some((s) => s.trim()) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">Aperçu :</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.competences_requises
                      .filter((skill) => skill.trim() !== '')
                      .map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>

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

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-circle-dot mr-2 text-purple-600"></i>
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="attent">En attente</option>
                <option value="Traité">Traité</option>
                <option value="Refusé">Refusé</option>
              </select>
            </div>

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

export default EditReunion
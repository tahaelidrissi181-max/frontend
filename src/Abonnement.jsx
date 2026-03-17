import React, { useState, useEffect } from 'react'
import api from './api/axios'
import { Link } from 'react-router-dom'

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const planColors = {
  Basic:    'from-blue-400 to-cyan-500',
  Standard: 'from-violet-500 to-purple-700',
  Premium:  'from-amber-400 to-orange-500',
}

const planIcons = {
  Basic:    'fa-star',
  Standard: 'fa-gem',
  Premium:  'fa-crown',
}

const defaultForm = { type: '', price: '' }

// ── Slide-in Form ─────────────────────────────────────────────
const AbonnementForm = ({ isOpen, onClose, onSave, editingAbonnement }) => {
  const [formData, setFormData] = useState(defaultForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const isEdit = !!editingAbonnement

  useEffect(() => {
    if (!isOpen) return
    setFormData(isEdit
      ? { type: editingAbonnement.type, price: String(editingAbonnement.price) }
      : defaultForm
    )
    setFormError('')
  }, [isOpen, editingAbonnement])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      setFormError('Veuillez entrer un prix valide.')
      return
    }
    if (!isEdit && !formData.type.trim()) {
      setFormError('Veuillez entrer un type.')
      return
    }
    setIsSubmitting(true)
    setFormError('')
    try {
      await onSave(isEdit
        ? { price: Number(formData.price) }
        : { type: formData.type.trim(), price: Number(formData.price) }
      )
      onClose()
    } catch (err) {
      setFormError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-purple-700">
                <i className={`fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus'} mr-2`}></i>
                {isEdit ? 'Modifier le prix' : 'Nouvel abonnement'}
              </h2>
              {isEdit && (
                <p className="text-sm text-gray-500 mt-1">Plan <strong>{editingAbonnement.type}</strong></p>
              )}
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:rotate-90 duration-300">
              <i className="fa-solid fa-times text-gray-600"></i>
            </button>
          </div>

          {/* Read-only info (edit mode only) */}
          {isEdit && (
            <div className="mb-6 space-y-3">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-400 font-medium mb-1">ID</p>
                <p className="text-sm font-semibold text-gray-700">#{editingAbonnement.id}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-400 font-medium mb-1">Type</p>
                <p className="text-sm font-semibold text-gray-700">{editingAbonnement.type}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-black">
            {/* Type (add mode only) */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  <i className="fa-solid fa-box mr-2 text-purple-600"></i>
                  Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={e => { setFormData(p => ({ ...p, type: e.target.value })); setFormError('') }}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${formError ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'border-gray-300 focus:ring-purple-500'}`}
                  placeholder="Ex: Basic, Standard, Premium"
                />
              </div>
            )}

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                <i className="fa-solid fa-tag mr-2 text-purple-600"></i>
                Prix (MAD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price}
                  onChange={e => { setFormData(p => ({ ...p, price: e.target.value })); setFormError('') }}
                  required
                  min="1"
                  className={`w-full px-4 py-3 pr-16 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${formError ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'border-gray-300 focus:ring-purple-500'}`}
                  placeholder="Ex: 150"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">MAD</span>
              </div>
              {formError && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-exclamation" />
                  {formError}
                </p>
              )}
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
                  : <><i className="fa-solid fa-check mr-2"></i>{isEdit ? 'Enregistrer' : 'Créer'}</>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

// ── Main Component ────────────────────────────────────────────
const Abonnement = () => {
  const [abonnements, setAbonnements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAbonnement, setEditingAbonnement] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [popupMsg, setPopupMsg] = useState('')

  useEffect(() => { fetchAbonnements() }, [])

  const fetchAbonnements = async () => {
    setLoading(true)
    try {
      const res = await api.get('/abonnement')
      setAbonnements(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const notify = (msg) => {
    setPopupMsg(msg)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3500)
  }

  const handleOpenCreate = () => { setEditingAbonnement(null); setShowForm(true) }
  const handleOpenEdit   = (a) => { setEditingAbonnement(a); setShowForm(true) }

  const handleSave = async (payload) => {
    if (editingAbonnement) {
      await api.put(`/abonnements/${editingAbonnement.id}`, payload)
      notify('✅ Prix mis à jour avec succès !')
    } else {
      await api.post('/abonnements', payload)
      notify('✅ Abonnement créé avec succès !')
    }
    fetchAbonnements()
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-purple-600 to-purple-700 text-white p-4 sm:p-6 lg:p-8">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      {/* Popup */}
      <div className={`fixed top-6 right-6 z-[100] transition-all duration-500 ${showPopup ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-white text-gray-800 px-5 py-3 rounded-2xl shadow-2xl font-semibold text-sm border border-gray-100">
          {popupMsg}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Abonnements</h1>
          <p className="text-white/70 text-sm mt-1">{abonnements.length} plan{abonnements.length !== 1 ? 's' : ''} disponible{abonnements.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-white/25 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-all hover:-translate-y-0.5">
            <i className="fa-solid fa-plus text-xs"></i>
            Ajouter
          </button>
          <Link to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/20 text-white/45 hover:text-white/80 text-sm font-medium transition-all duration-300">
            <i className="fa-solid fa-house text-xs" />
            Accueil
          </Link>
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-white/70"></i>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {abonnements.map((a) => (
            <div key={a.id}
              className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">

              <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${planColors[a.type] ?? 'from-gray-400 to-gray-600'} opacity-20 blur-xl`} />

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${planColors[a.type] ?? 'from-gray-400 to-gray-600'} flex items-center justify-center mb-5 shadow-lg`}>
                <i className={`fa-solid ${planIcons[a.type] ?? 'fa-box'} text-2xl text-white`}></i>
              </div>

              <div className="mb-5">
                <span className="text-xs text-white/40 font-medium">ID #{a.id}</span>
                <h2 className="text-2xl font-bold text-white mb-3">{a.type}</h2>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">{a.price}</span>
                  <span className="text-white/60 text-sm mb-1.5">MAD </span>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <i className="fa-solid fa-calendar-plus w-3.5"></i>
                  <span>Créé le {formatDate(a.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <i className="fa-solid fa-calendar-check w-3.5"></i>
                  <span>Modifié le {formatDate(a.updated_at)}</span>
                </div>
              </div>

              <button
                onClick={() => handleOpenEdit(a)}
                className="w-full py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-pen text-xs"></i>
                Modifier le prix
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Slide-in Form */}
      <AbonnementForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        editingAbonnement={editingAbonnement}
      />
    </div>
  )
}

export default Abonnement
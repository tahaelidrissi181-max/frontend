import { useState, useEffect } from 'react'
import api from './api/axios'
import { Link } from 'react-router-dom'


const defaultForm = {
  name: '',
  email: '',
  password: '',
  role: 'support',
  status: 'active',
}

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

const avatarColors = [
  'from-violet-500 to-purple-700',
  'from-blue-400 to-cyan-500',
  'from-emerald-400 to-teal-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
]

// ── sub-components ────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    admin:   'bg-purple-100 text-purple-700 border-purple-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    user:    'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[role] ?? map.user}`}>
      {role}
    </span>
  )
}

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
    status === 'active'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-red-50 text-red-600 border-red-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-emerald-500' : 'bg-red-400'}`} />
    {status === 'active' ? 'Actif' : 'Inactif'}
  </span>
)

// ── slide-in form ─────────────────────────────────────────────
const UserForm = ({ isOpen, onClose, onSave, editingUser, onError }) => {
  const [formData, setFormData] = useState(defaultForm)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const isEdit = !!editingUser

  useEffect(() => {
    if (!isOpen) return
    setFormData(isEdit
      ? { name: editingUser.name ?? '', email: editingUser.email ?? '', password: '', role: editingUser.role ?? 'support', status: editingUser.status ?? 'active' }
      : defaultForm
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
    try {
      const payload = { ...formData }
      if (isEdit && !payload.password) delete payload.password
      await onSave(payload)
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

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      )}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-purple-700">
              <i className={`fa-solid ${isEdit ? 'fa-user-pen' : 'fa-user-plus'} mr-2`}></i>
              {isEdit ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
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
                Mot de passe {!isEdit && <span className="text-red-500">*</span>}
                {isEdit && <span className="text-xs text-gray-400 font-normal ml-1">(laisser vide pour ne pas changer)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEdit}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={isEdit ? '••••••••' : 'Minimum 8 caractères'}
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

// ── main component ────────────────────────────────────────────
const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [popupMsg, setPopupMsg] = useState('')
  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data)
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

  const handleOpenCreate = () => { setEditingUser(null); setShowForm(true) }
  const handleOpenEdit   = (u) => { setEditingUser(u); setShowForm(true) }

  const handleSave = async (payload) => {
    if (editingUser) {
      await api.put(`/users/${editingUser.id}`, payload)
      notify('✅ Utilisateur mis à jour avec succès !')
    } else {
      await api.post('/users', payload)
      notify('✅ Utilisateur créé avec succès !')
    }
    fetchUsers()
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`Supprimer "${user.name}" ?`)) return
    try {
      await api.delete(`/user/${user.id}`)
      notify('🗑️ Utilisateur supprimé.')
      fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    try {
      await api.put(`/users/${user.id}`, { status: newStatus })
      notify(`✅ Statut changé en "${newStatus === 'active' ? 'Actif' : 'Inactif'}"`)
      fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase())
      || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchRole   = roleFilter   === 'all' || u.role   === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

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
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-white/70 text-sm mt-1">{users.length} utilisateur{users.length !== 1 ? 's' : ''} au total</p>
        </div>
        <Link to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-white/10 bg-white/10 hover:bg-white/20 text-white/45 hover:text-white/80 text-sm font-medium transition-all duration-300">
            <i className="fa-solid fa-house text-xs" />
            Accueil
          </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 bg-white/20 backdrop-blur-md px-5 py-3 rounded-full flex items-center gap-3 border border-white/20">
          <i className="fa-solid fa-magnifying-glass text-white/70"></i>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou email..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-white/60" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-full border border-white/20 text-white text-sm outline-none cursor-pointer min-w-[140px]">
          <option value="all" className="bg-purple-700">Tous les rôles</option>
          <option value="support" className="bg-purple-700">Support</option>
                <option value="client" className="bg-purple-700">Client</option>
                <option value="admin" className="bg-purple-700">Admin</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-full border border-white/20 text-white text-sm outline-none cursor-pointer min-w-[140px]">
          <option value="all"      className="bg-purple-700">Tous statuts</option>
          <option value="active"   className="bg-purple-700">Actif</option>
          <option value="inactive" className="bg-purple-700">Inactif</option>
        </select>
        <button onClick={handleOpenCreate}
          className="bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/25 text-white font-semibold flex items-center gap-2 transition-all hover:bg-white/30 hover:-translate-y-0.5 text-sm">
          <i className="fa-solid fa-user-plus"></i>
          Ajouter utilisateur
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-white/70"></i>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/60">
            <i className="fa-solid fa-users-slash text-4xl mb-3 block"></i>
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20 text-white/70 text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-4 font-semibold">Utilisateur</th>
                  <th className="text-left px-6 py-4 font-semibold hidden md:table-cell">Rôle</th>
                  <th className="text-left px-6 py-4 font-semibold hidden sm:table-cell">Statut</th>
                  <th className="text-left px-6 py-4 font-semibold hidden lg:table-cell">Créé le</th>
                  <th className="text-right px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((user, index) => (
                  <tr key={user.id} className="hover:bg-white/10 transition-colors group">
                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{user.name}</div>
                          <div className="text-white/60 text-xs">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <RoleBadge role={user.role} />
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <StatusBadge status={user.status} />
                    </td>
                    {/* Created at */}
                    <td className="px-6 py-4 hidden lg:table-cell text-white/60 text-sm">
                      {formatDate(user.created_at)}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle status */}
                        <button onClick={() => handleToggleStatus(user)}
                          title={user.status === 'active' ? 'Désactiver' : 'Activer'}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5 ${
                            user.status === 'active'
                              ? 'bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300'
                              : 'bg-gray-400/20 hover:bg-gray-400/30 text-gray-300'
                          }`}>
                          <i className={`fa-solid ${user.status === 'active' ? 'fa-toggle-on' : 'fa-toggle-off'} text-sm`}></i>
                        </button>
                        
                        {user.role!='client'?<button onClick={() => handleOpenEdit(user)} title="Modifier"
                          className="w-8 h-8 rounded-full bg-purple-400/20 hover:bg-purple-400/30 text-purple-200 flex items-center justify-center transition-all hover:-translate-y-0.5">
                          <i className="fa-solid fa-pen text-xs"></i>
                        </button>:null}
                        
                        <button onClick={() => handleDelete(user)} title="Supprimer"
                          className="w-8 h-8 rounded-full bg-red-400/20 hover:bg-red-400/30 text-red-300 flex items-center justify-center transition-all hover:-translate-y-0.5">
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-white/10 text-white/50 text-xs">
            {filtered.length} sur {users.length} utilisateur{users.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Slide-in Form */}
      <UserForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={handleSave}
        editingUser={editingUser}
        onError={notify}
      />
    </div>
  )
}

export default Users
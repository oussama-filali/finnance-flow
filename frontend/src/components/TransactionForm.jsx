import { useState } from 'react'
import { motion } from 'framer-motion'

const TransactionForm = ({ transaction, categories, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState(
    transaction || {
      title: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      location: '',
      category_id: '',
      subcategory_id: '',
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="glass rounded-3xl shadow-2xl mb-6 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <i className={`fas ${transaction ? 'fa-edit' : 'fa-plus'} text-white text-2xl`}></i>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            {transaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </h3>
          <p className="text-sm text-gray-600">Remplissez les informations</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-tag"></i>
              <span>Titre *</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none glass"
              required
              placeholder="Ex: Course supermarché"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-euro-sign"></i>
              <span>Montant (€) *</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 outline-none glass"
              required
              placeholder="0.00"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-calendar"></i>
              <span>Date *</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none glass"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-map-marker-alt"></i>
              <span>Lieu</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 outline-none glass"
              placeholder="Ex: Carrefour Paris"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-folder-open"></i>
              <span>Catégorie</span>
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none glass appearance-none cursor-pointer"
              disabled={isLoading}
            >
              <option value="">Sélectionner...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-align-left"></i>
              <span>Description</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 outline-none glass resize-none"
              rows="3"
              placeholder="Détails supplémentaires..."
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <i className={`fas ${transaction ? 'fa-save' : 'fa-plus'}`}></i>
                <span>{transaction ? 'Enregistrer' : 'Créer'}</span>
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isLoading}
            className="px-6 py-3 glass text-gray-700 rounded-2xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-times"></i>
            <span>Annuler</span>
          </button>
        </div>
      </form>
    </motion.div>
  )
}

export default TransactionForm

import { motion } from 'framer-motion'

const FilterBar = ({ filter, setFilter, categories, resultCount }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 80 }}
      className="glass rounded-3xl shadow-xl mb-6 p-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <i className="fas fa-search"></i>
            <span>Rechercher</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Titre, description, lieu..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full px-4 py-3 pl-11 rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 outline-none glass"
            />
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            {filter.search && (
              <button
                onClick={() => setFilter({ ...filter, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
        
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <i className="fas fa-folder"></i>
            <span>Catégorie</span>
          </label>
          <div className="relative">
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="w-full px-4 py-3 pl-11 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 outline-none glass appearance-none cursor-pointer"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <i className="fas fa-folder-open absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
          </div>
        </div>
      </div>
      
      {(filter.search || filter.category) && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              <i className="fas fa-list-ul mr-2"></i>
              {resultCount} résultat{resultCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setFilter({ category: '', search: '' })}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <i className="fas fa-redo"></i>
              <span>Réinitialiser</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default FilterBar

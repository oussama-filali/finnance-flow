import { motion, AnimatePresence } from 'framer-motion'

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl border-2 border-dashed border-gray-300 text-center py-16"
      >
        <i className="fas fa-inbox text-7xl text-gray-300 mb-4"></i>
        <p className="text-gray-600 text-xl font-semibold mb-2">Aucune transaction trouvée</p>
        <p className="text-gray-400 text-sm">Créez votre première transaction ou importez un relevé</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ delay: index * 0.03, type: 'spring', stiffness: 100 }}
            whileHover={{ scale: 1.01, y: -2 }}
            className="group glass rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border-l-4 border-primary-500"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{transaction.title}</h3>
                      {transaction.category_id && (
                        <span className="glass px-2 py-1 text-primary-700 text-xs font-semibold rounded-lg">
                          <i className="fas fa-tag mr-1"></i>
                          Cat. {transaction.category_id}
                        </span>
                      )}
                    </div>
                    {transaction.description && (
                      <p className="text-gray-600 text-sm">{transaction.description}</p>
                    )}
                  </div>
                  
                  <div className={`ml-4 px-4 py-2 rounded-2xl font-bold text-lg shadow-sm ${
                    parseFloat(transaction.amount) >= 0 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' 
                      : 'bg-gradient-to-br from-red-400 to-rose-500 text-white'
                  }`}>
                    {parseFloat(transaction.amount) >= 0 ? '+' : ''}
                    {parseFloat(transaction.amount).toFixed(2)} €
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl font-medium text-blue-700">
                    <i className="fas fa-calendar"></i>
                    <span>{new Date(transaction.date).toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  
                  {transaction.location && (
                    <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl font-medium text-orange-700">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{transaction.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => onEdit(transaction)}
                  className="w-10 h-10 flex items-center justify-center glass hover:bg-primary-100 text-primary-700 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                  title="Modifier"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="w-10 h-10 flex items-center justify-center glass hover:bg-red-100 text-red-700 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm"
                  title="Supprimer"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default TransactionList

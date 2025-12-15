import { motion } from 'framer-motion'

const RecentTransactions = ({ transactions }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="card"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Transactions Récentes</h3>

      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucune transaction</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-800">{transaction.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <span
                className={`font-bold ${
                  parseFloat(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {parseFloat(transaction.amount) >= 0 ? '+' : ''}
                {parseFloat(transaction.amount).toFixed(2)} €
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default RecentTransactions

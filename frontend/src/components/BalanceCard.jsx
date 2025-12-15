import { motion } from 'framer-motion'

const BalanceCard = ({ balance }) => {
  const isPositive = balance >= 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white"
    >
      <h3 className="text-lg font-semibold mb-2 opacity-90">💰 Solde Total</h3>
      <p className={`text-4xl font-bold ${isPositive ? 'text-white' : 'text-red-300'}`}>
        {parseFloat(balance).toFixed(2)} €
      </p>
      <p className="mt-2 text-sm opacity-75">
        {isPositive ? '✅ Situation positive' : '⚠️ Attention au budget'}
      </p>
    </motion.div>
  )
}

export default BalanceCard

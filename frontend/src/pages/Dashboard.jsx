import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { transactionAPI } from '../services/api'
import BalanceCard from '../components/BalanceCard'
import TransactionChart from '../components/TransactionChart'
import RecentTransactions from '../components/RecentTransactions'
// import Scene3D from '../components/Scene3D' // Désactivé temporairement

const Dashboard = () => {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        transactionAPI.getBalance(),
        transactionAPI.getAll(),
      ])
      setBalance(balanceRes.data.balance)
      setTransactions(transactionsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="mt-2 text-gray-600">Vue d'ensemble de vos finances</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <BalanceCard balance={balance} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">📈 Total Transactions</h3>
          <p className="text-3xl font-bold text-primary-600">{transactions.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 Moyenne</h3>
          <p className="text-3xl font-bold text-golden-500">
            {transactions.length > 0
              ? (transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0) / transactions.length).toFixed(2)
              : '0.00'}{' '}
            €
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionChart transactions={transactions} />
        <RecentTransactions transactions={transactions.slice(0, 5)} />
      </div>

      {/* Visualisation 3D - Désactivée temporairement */}
      {/* <Scene3D /> */}
    </div>
  )
}

export default Dashboard

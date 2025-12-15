import { motion } from 'framer-motion'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import { Pie, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement)

const TransactionChart = ({ transactions }) => {
  // Données pour le graphique en camembert (par catégorie)
  const categoryData = transactions.reduce((acc, t) => {
    const cat = t.category_id || 'Non catégorisé'
    acc[cat] = (acc[cat] || 0) + Math.abs(parseFloat(t.amount))
    return acc
  }, {})

  const pieData = {
    labels: Object.keys(categoryData).map(k => `Catégorie ${k}`),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          '#0ea5e9',
          '#f59e0b',
          '#10b981',
          '#8b5cf6',
          '#ef4444',
          '#ec4899',
          '#14b8a6',
          '#f97316',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  // Données pour l'évolution (derniers 7 jours)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const dailyTotals = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => t.date === date)
    return dayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
  })

  const lineData = {
    labels: last7Days.map(d => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short' })),
    datasets: [
      {
        label: 'Évolution (7 jours)',
        data: dailyTotals,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className="card"
    >
      <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Répartition par Catégorie</h3>
      
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Pas de données à afficher</p>
      ) : (
        <div className="h-64">
          <Pie data={pieData} options={options} />
        </div>
      )}
    </motion.div>
  )
}

export default TransactionChart

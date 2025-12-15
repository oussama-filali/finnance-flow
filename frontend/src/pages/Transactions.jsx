import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTransactions, useCategories, useCreateTransaction, useUpdateTransaction, useDeleteTransaction, useImport } from '../utils/queries'
import TransactionList from '../components/TransactionList'
import TransactionForm from '../components/TransactionForm'
import ImportZone from '../components/ImportZone'
import FilterBar from '../components/FilterBar'

const Transactions = () => {
  const { data: transactions = [], isLoading } = useTransactions()
  const { data: categories = [] } = useCategories()
  const createMutation = useCreateTransaction()
  const updateMutation = useUpdateTransaction()
  const deleteMutation = useDeleteTransaction()
  const importMutation = useImport()

  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [filter, setFilter] = useState({ category: '', search: '' })

  const handleCreate = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => setShowForm(false)
    })
  }

  const handleUpdate = (id, data) => {
    updateMutation.mutate({ id, data }, {
      onSuccess: () => {
        setEditingTransaction(null)
        setShowForm(false)
      }
    })
  }

  const handleDelete = (id) => {
    if (confirm('Supprimer cette transaction ?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleImport = (file) => {
    return importMutation.mutateAsync(file)
  }

  const filteredTransactions = transactions.filter(t => {
    const matchCategory = !filter.category || t.category_id === parseInt(filter.category)
    const matchSearch = !filter.search || 
      t.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      t.description?.toLowerCase().includes(filter.search.toLowerCase())
    return matchCategory && matchSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <i className="fas fa-credit-card mr-3 text-primary-600"></i>
              Transactions
            </h1>
            <p className="text-gray-600">Gérez toutes vos transactions</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingTransaction(null)
              setShowForm(true)
            }}
            className="glass px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-primary-600"
          >
            <i className="fas fa-plus"></i>
            <span>Nouvelle transaction</span>
          </motion.button>
        </div>
      </motion.div>

      <ImportZone onImport={handleImport} isLoading={importMutation.isPending} />

      <FilterBar 
        filter={filter}
        setFilter={setFilter}
        categories={categories}
        resultCount={filteredTransactions.length}
      />

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          categories={categories}
          onSubmit={editingTransaction ? (data) => handleUpdate(editingTransaction.id, data) : handleCreate}
          onCancel={() => {
            setShowForm(false)
            setEditingTransaction(null)
          }}
          isLoading={editingTransaction ? updateMutation.isPending : createMutation.isPending}
        />
      )}

      <TransactionList
        transactions={filteredTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}

export default Transactions

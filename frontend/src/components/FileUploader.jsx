import { useState } from 'react'
import { motion } from 'framer-motion'

const FileUploader = ({ onUpload, accept = '.csv,.pdf', label = 'Importer un fichier' }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState('')

  const handleFile = async (file) => {
    if (!file) return
    
    setUploading(true)
    setStatus('⏳ Upload en cours...')
    
    try {
      const result = await onUpload(file)
      setStatus(`✅ ${result.message || 'Upload réussi !'}`)
    } catch (error) {
      setStatus(`❌ Erreur: ${error.message}`)
    } finally {
      setUploading(false)
      setTimeout(() => setStatus(''), 5000)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div>
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-primary-500 bg-primary-50 scale-105' 
            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
        }`}
      >
        <div className="mb-4">
          <div className="text-6xl mb-3">{isDragging ? '📂' : '📁'}</div>
          <p className="text-lg font-semibold text-gray-700 mb-1">
            {isDragging ? 'Déposez votre fichier ici' : label}
          </p>
          <p className="text-sm text-gray-500">
            Glissez-déposez ou cliquez pour sélectionner
          </p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
            disabled={uploading}
          />
          <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            <span>📤</span>
            <span>Sélectionner un fichier</span>
          </span>
        </label>

        {uploading && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-primary-700 font-medium">Traitement en cours...</span>
          </div>
        )}
      </motion.div>

      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 px-4 py-3 rounded-xl border ${
            status.includes('✅')
              ? 'bg-green-50 border-green-200 text-green-700'
              : status.includes('❌')
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}
        >
          <p className="text-sm font-medium">{status}</p>
        </motion.div>
      )}
    </div>
  )
}

export default FileUploader

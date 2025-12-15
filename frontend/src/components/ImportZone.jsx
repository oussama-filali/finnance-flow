import { useState } from 'react'
import { motion } from 'framer-motion'
import Tesseract from 'tesseract.js'
import { importAPI } from '../services/api'

const ImportZone = ({ onImport, isLoading }) => {
  const [status, setStatus] = useState('')
  const [ocrProcessing, setOcrProcessing] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop().toLowerCase()
    
    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      await handleImageImport(file)
    } else {
      await handleStandardImport(file)
    }
  }

  const handleStandardImport = async (file) => {
    setStatus('Analyse en cours...')
    try {
      const res = await onImport(file)
      setStatus(`Import réussi ! ${res.data.imported} transactions ajoutées`)
    } catch (err) {
      setStatus('Échec : ' + (err.response?.data?.error || err.message))
    }
  }

  const handleImageImport = async (file) => {
    setOcrProcessing(true)
    setStatus('Lecture de l\'image (OCR)...')
    
    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'fra',
        { logger: m => console.log(m) }
      )
      
      setStatus('Analyse du texte extrait...')
      const res = await importAPI.importText(text)
      setStatus(`Import réussi ! ${res.data.imported} transactions trouvées dans l'image`)
    } catch (err) {
      setStatus('Échec OCR : ' + err.message)
    } finally {
      setOcrProcessing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15, type: 'spring', stiffness: 100 }}
      className="glass rounded-3xl shadow-xl mb-6 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
          <i className="fas fa-file-import text-white text-xl"></i>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Importer vos transactions</h3>
          <p className="text-sm text-gray-600">Relevé bancaire CSV, PDF ou Image (PNG/JPG)</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Glissez votre fichier ou cliquez pour sélectionner
      </p>
      
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer group">
          <input 
            type="file" 
            accept=".csv,.pdf,.png,.jpg,.jpeg" 
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading || ocrProcessing}
          />
          <div className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2">
            <i className="fas fa-upload"></i>
            <span>Choisir un fichier</span>
          </div>
        </label>
        
        {(isLoading || ocrProcessing) && (
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl shadow-sm">
            <i className="fas fa-spinner fa-spin text-primary-600"></i>
            <span className="text-sm text-primary-700 font-medium">
              {ocrProcessing ? 'Lecture OCR...' : 'Traitement...'}
            </span>
          </div>
        )}
      </div>
      
      {status && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 px-4 py-3 rounded-xl glass ${
            status.includes('réussi') 
              ? 'border-2 border-green-400 text-green-700' 
              : 'border-2 border-red-400 text-red-700'
          }`}
        >
          <p className="text-sm font-medium">
            <i className={`fas ${status.includes('réussi') ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
            {status}
          </p>
        </motion.div>
      )}
      
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="glass px-3 py-1 rounded-full text-xs font-medium text-gray-600">
          <i className="fas fa-file-csv mr-1"></i>CSV
        </span>
        <span className="glass px-3 py-1 rounded-full text-xs font-medium text-gray-600">
          <i className="fas fa-file-pdf mr-1"></i>PDF
        </span>
        <span className="glass px-3 py-1 rounded-full text-xs font-medium text-gray-600">
          <i className="fas fa-image mr-1"></i>IMG
        </span>
      </div>
    </motion.div>
  )
}

export default ImportZone

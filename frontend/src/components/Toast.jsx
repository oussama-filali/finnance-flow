import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const types = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      icon: '✅',
      border: 'border-green-300'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      icon: '❌',
      border: 'border-red-300'
    },
    warning: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      icon: '⚠️',
      border: 'border-yellow-300'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      icon: 'ℹ️',
      border: 'border-blue-300'
    }
  }

  const style = types[type] || types.info

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`${style.bg} text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[300px] border-2 ${style.border}`}
    >
      <span className="text-2xl">{style.icon}</span>
      <p className="flex-1 font-semibold text-sm">{message}</p>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors text-xl leading-none"
      >
        ✕
      </button>
    </motion.div>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

export { Toast, ToastContainer }
export default Toast

/**
 * Interpréteur du Langage Harmonique
 * Basé sur le nombre d'or (φ = 1.618) et la suite de Fibonacci
 */

const PHI = 1.618033988749895

// Suite de Fibonacci
const fibonacci = (n) => {
  const fib = [0, 1]
  for (let i = 2; i <= n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2]
  }
  return fib
}

// Générer des proportions harmoniques
export const goldenRatio = {
  // Proportions basées sur φ
  phi: PHI,
  phiInverse: 1 / PHI, // 0.618
  phi2: PHI * PHI, // 2.618
  phi3: PHI * PHI * PHI, // 4.236

  // Espacements harmoniques (en rem)
  spacing: {
    xs: `${0.618}rem`,
    sm: `${1}rem`,
    md: `${PHI}rem`,
    lg: `${PHI * PHI}rem`,
    xl: `${PHI * PHI * PHI}rem`,
  },

  // Durées d'animation (en secondes)
  duration: {
    fast: 0.382,
    normal: 0.618,
    slow: 1.0,
    slower: PHI,
  },

  // Séquence de Fibonacci pour animations
  fibSequence: fibonacci(10),

  // Calculer une proportion harmonique
  scale: (base, level = 1) => {
    return base * Math.pow(PHI, level)
  },
}

// Appliquer les proportions φ aux éléments
export const applyHarmonicStyles = (element, options = {}) => {
  const {
    baseSize = 16,
    scaleLevel = 1,
    animationDuration = goldenRatio.duration.normal,
  } = options

  if (!element) return

  element.style.fontSize = `${goldenRatio.scale(baseSize, scaleLevel)}px`
  element.style.transition = `all ${animationDuration}s ease-in-out`
}

// Animations Fibonacci
export const fibonacciAnimation = {
  // Délai d'apparition basé sur Fibonacci
  stagger: (index) => {
    const fib = goldenRatio.fibSequence
    return (fib[index % fib.length] / 100) * goldenRatio.duration.normal
  },

  // Scale basé sur φ
  scaleVariants: {
    hidden: { scale: 1 / PHI, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: goldenRatio.duration.normal,
        ease: 'easeOut',
      },
    },
  },

  // Slide harmonique
  slideVariants: {
    hidden: { x: -100 * goldenRatio.phiInverse, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: goldenRatio.duration.slow,
        ease: [0.618, 0, 0.382, 1], // Courbe de Bézier harmonique
      },
    },
  },
}

// Parser simple pour le langage harmonique (main.harm)
export const parseHarmonic = (code) => {
  const rules = {}
  const lines = code.split('\n')

  lines.forEach((line) => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split(':').map((s) => s.trim())
      if (key && value) {
        // Remplacer les valeurs spéciales
        let parsedValue = value.replace('phi', PHI.toString())
        parsedValue = parsedValue.replace(/fib\((\d+)\)/g, (_, n) => {
          return goldenRatio.fibSequence[parseInt(n)]
        })

        rules[key] = parsedValue.replace(';', '')
      }
    }
  })

  return rules
}

export default goldenRatio

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070A12',
          900: '#0B1020',
          850: '#0f172a',
          800: '#111c33',
          750: '#142244',
          700: '#1e293b',
        },
        neon: {
          cyan: '#22d3ee',
          aqua: '#2efbd3',
          blue: '#60a5fa',
          violet: '#a78bfa',
          indigo: '#6366f1',
          magenta: '#f472b6',
          lime: '#a3ff12',
        },
      },
      boxShadow: {
        glowCyan: '0 0 0 1px rgba(34,211,238,0.25), 0 0 24px rgba(34,211,238,0.35), 0 0 72px rgba(34,211,238,0.18)',
        glowViolet: '0 0 0 1px rgba(167,139,250,0.25), 0 0 24px rgba(167,139,250,0.35), 0 0 72px rgba(167,139,250,0.18)',
        glowIndigo: '0 0 0 1px rgba(99,102,241,0.25), 0 0 26px rgba(99,102,241,0.32), 0 0 88px rgba(99,102,241,0.18)',
        glass: '0 10px 40px rgba(0,0,0,0.35)',
      },
      dropShadow: {
        neon: '0 0 10px rgba(34,211,238,0.55)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-10px,0)' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 0 rgba(34,211,238,0.0))' },
          '50%': { filter: 'drop-shadow(0 0 18px rgba(34,211,238,0.45))' },
        },
        scanlines: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.8s ease-in-out infinite',
        scanlines: 'scanlines 10s linear infinite',
      },
    },
  },
  plugins: [],
}


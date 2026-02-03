/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forfeo: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          DEFAULT: '#15803d', // Vert professionnel
          800: '#166534',
          900: '#14532d',
        }
      },
      animation: {
        'spin-slow': 'spin 10s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          'from': {
            filter: 'drop-shadow(0 0 2px rgba(72, 187, 120, 0.6))',
          },
          'to': {
            filter: 'drop-shadow(0 0 6px rgba(72, 187, 120, 0.9))',
          }
        }
      }
    },
  },
  plugins: [],
}

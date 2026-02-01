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
          light: '#4caf50',
          DEFAULT: '#2E7D32', // Notre vert signature
          dark: '#1b5e20',
        }
      }
    },
  },
  plugins: [],
}

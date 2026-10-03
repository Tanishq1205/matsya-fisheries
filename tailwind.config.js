/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matsya: {
          navy: '#1D184D',
          darkNavy: '#0E0C26',
          gold: '#D5C582',
          sand: '#FAF7EE',
          border: '#EADFCA',
          accent: '#E06B43',
        }
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest-editorial': '0.28em',
      }
    },
  },
  plugins: [],
}
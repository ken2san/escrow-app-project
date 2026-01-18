/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideInFromRight: {
          'from': { transform: 'translateX(100%)', opacity: '0.5' },
          'to': { transform: 'translateX(0)', opacity: '1' }
        },
        slideInFromLeft: {
          'from': { transform: 'translateX(-100%)', opacity: '0.5' },
          'to': { transform: 'translateX(0)', opacity: '1' }
        }
      },
      animation: {
        'slide-in-from-right': 'slideInFromRight 0.25s ease-out',
        'slide-in-from-left': 'slideInFromLeft 0.25s ease-out'
      }
    },
  },
  plugins: [],
}

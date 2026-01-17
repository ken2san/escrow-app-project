/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideIn: {
          'from': { transform: 'translateX(-100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' }
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out'
      }
    },
  },
  plugins: [],
}

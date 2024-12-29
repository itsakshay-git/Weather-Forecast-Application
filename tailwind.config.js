/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      screens: {
        'custom-360-414': {'min': '340px', 'max': '431px'},
        'custom-360-375': { 'min': '360px', 'max': '375px' },
        'custom-540': '540px',
        'custom-768': '768px',
        'portrait': { 'raw': '(orientation: portrait)' }
      },
      colors:{
        'custom-light-gray': 'rgba(146,143,143,0.13)',
        'custom-light-blue': 'rgba(58,117,207,0.5)',
        'custom-dark':'rgba(11,17,29,1)'
      }
    },
  },
  plugins: [],
}


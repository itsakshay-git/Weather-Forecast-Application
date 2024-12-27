/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors:{
        'custom-light-gray': 'rgba(146,143,143,0.13)',
        'custom-light-blue': 'rgba(58,117,207,0.5)'
      }
    },
  },
  plugins: [],
}


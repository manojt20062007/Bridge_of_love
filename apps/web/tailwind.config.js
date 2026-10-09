/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-components/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B1B2B',
          navyLight: '#18314F',
          navyDark: '#060F18',
          coral: '#D94A3D',
          coralHover: '#C23A2E',
          coralLight: '#FFF1F0',
          cream: '#FAF8F5',
          creamDark: '#F2ECE4',
          gold: '#C59B27',
          goldLight: '#FEF8E7',
          green: '#15803D',
          greenLight: '#ECFDF5',
        },
      },
      fontFamily: {
        serif: ["'Cinzel'", "'Playfair Display'", "'Lora'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
    },
  },
  plugins: [],
};

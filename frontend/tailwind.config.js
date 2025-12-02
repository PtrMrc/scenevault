/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E50914',
        dark: '#141414',
        darker: '#000000',
        gray: '#808080',
      }
    },
  },
  plugins: [],
}
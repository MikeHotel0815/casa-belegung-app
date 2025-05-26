/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Standard für Create React App
    "./public/index.html"        // Falls Sie dort Klassen verwenden
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
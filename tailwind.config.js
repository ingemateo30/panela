/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados para panela
        panela: {
          50: '#fdf7f0',
          100: '#faebd7', 
          200: '#f5d5ae',
          300: '#edb878',
          400: '#e39540',
          500: '#d87c3c',
          600: '#c86a2e',
          700: '#a67c52',
          800: '#8d5f3c', 
          900: '#744d30',
          950: '#3e2818',
        }
      }
    },
  },
  plugins: [],
}
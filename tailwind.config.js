/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", 
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        panela: {
          50: '#fdf8f0',
          100: '#faebd7',
          200: '#f5d5ae',
          300: '#efb881',
          400: '#e89452',
          500: '#d97334',
          600: '#ca6328',
          700: '#a84d24',
          800: '#864025',
          900: '#6d3520',
          950: '#3b1a0f',
        },
      }
    },
  },
  plugins: [],
}
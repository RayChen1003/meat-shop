/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B2500',
        'primary-dark': '#5C1A00',
        accent: '#D4A574',
      },
    },
  },
  plugins: [],
}

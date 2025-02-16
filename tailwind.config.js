/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'russian-violet': '#0d0630',
        'prussian-blue': '#18314f',
        'yinmn-blue': '#384e77',
        'cambridge-blue': '#8bbeb2',
        'mindaro': '#e6f9af',
        'primary': '#18314f', // prussian-blue
        'primary-light': '#384e77', // yinmn-blue
        'accent': '#8bbeb2', // cambridge-blue
        'accent-light': '#e6f9af', // mindaro
        'text-primary': '#0d0630', // russian-violet
        'text-secondary': '#384e77', // yinmn-blue
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'pt-sans': ['"PT Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './index.tsx', './App.tsx', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Oswald"', 'sans-serif'],
        sans: ['"Manrope"', 'sans-serif'],
        arabic: ['"Cairo"', 'sans-serif'],
      },
      colors: {
        nasr: {
          silver: '#E8ECEC',
          steel: '#647176',
          dark: '#111719',
          blue: '#7B868A',
          red: '#E60012',
          accent: '#BFC2C1',
        },
      },
      backgroundImage: {
        'metal-gradient': 'linear-gradient(135deg, #f4f6f5 0%, #bfc8ca 100%)',
      },
    },
  },
  plugins: [],
};

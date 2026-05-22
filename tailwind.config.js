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
          silver: '#E5E7EB',
          steel: '#4B5563',
          dark: '#111827',
          blue: '#009FE3',
          red: '#E60012',
          accent: '#10B981',
        },
      },
      backgroundImage: {
        'metal-gradient': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      },
    },
  },
  plugins: [],
};

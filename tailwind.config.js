/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Soft color palette - açık mavi, gri ve beyaz tonları
        primary: {
          50: '#f0f9ff',   // Çok açık mavi
          100: '#e0f2fe',  // Açık mavi
          200: '#bae6fd',  // Yumuşak mavi
          300: '#7dd3fc',  // Orta açık mavi
          400: '#38bdf8',  // Canlı açık mavi
          500: '#0ea5e9',  // Standart mavi
          600: '#0284c7',  // Koyu mavi
          700: '#0369a1',  // Daha koyu mavi
          800: '#075985',  // Çok koyu mavi
          900: '#0c4a6e',  // En koyu mavi
        },
        gray: {
          50: '#fafafa',   // Neredeyse beyaz
          100: '#f5f5f5',  // Çok açık gri
          200: '#e5e5e5',  // Açık gri
          300: '#d4d4d4',  // Orta açık gri
          400: '#a3a3a3',  // Orta gri
          500: '#737373',  // Standart gri
          600: '#525252',  // Koyu gri
          700: '#404040',  // Daha koyu gri
          800: '#262626',  // Çok koyu gri
          900: '#171717',  // En koyu gri
        },
        accent: {
          light: '#f8fafc',  // Çok açık gri-mavi
          soft: '#e2e8f0',   // Yumuşak gri
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}



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
          50: '#fffef0',   // Çok açık sarı
          100: '#fffce0',  // Açık sarı
          200: '#fff9ba',  // Yumuşak sarı
          300: '#fff57d',  // Orta açık sarı
          400: '#fff138',  // Canlı açık sarı
          500: '#ffde59',  // Standart sarı (ana renk)
          600: '#ffd700',  // Koyu sarı
          700: '#e6c200',  // Daha koyu sarı
          800: '#ccad00',  // Çok koyu sarı
          900: '#b39900',  // En koyu sarı
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
          light: '#fffef5',  // Çok açık sarı-gri
          soft: '#fff9e2',   // Yumuşak sarı
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}



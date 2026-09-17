/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF7F2',
          light: '#FDFCF9',
          card: '#FFFFFF',
          border: '#EAE3D9',
          darker: '#F3EFEA',
        },
        charcoal: {
          DEFAULT: '#141414',
          light: '#262626',
          muted: '#737373',
          border: '#333333',
        },
        accent: {
          orange: '#FF5B00',
          'orange-hover': '#E65200',
          'orange-light': '#FFF3EB',
          'orange-border': '#FFD8C2',
        },
        forensic: {
          bg: '#FAF7F2',
          surface: '#ffffff',
          border: '#EAE3D9',
          'border-dark': '#D5CBC0',
          text: '#141414',
          muted: '#737373',
          accent: '#FF5B00',
          'accent-light': '#FFF3EB',
          authentic: '#059669',
          manipulated: '#DC2626',
          uncertain: '#D97706',
          ood: '#EA580C',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Playfair Display"', '"Newsreader"', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}

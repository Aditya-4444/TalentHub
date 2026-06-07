/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'page-bg': '#FAF3E8',
        'panel-bg': '#FDF7EE',
        'card-surface': '#FFFFFF',
        'nav-bg': '#FFFFFF',
        'primary-avocado': '#6B7C3F',
        'primary-hover': '#556130',
        'body-text': '#3B2F1E',
        'muted-text': '#7A6245',
        'border-divider': '#D4B896',
        'badge-ft-bg': '#E8EDD6',
        'badge-ft-text': '#4A5A28',
        'badge-remote-bg': '#FFF0C8',
        'badge-remote-text': '#7A5C00',
        'badge-pt-bg': '#F5ECD7',
        'badge-pt-text': '#6B4F2A',
        'badge-contract-bg': '#EEF0E6',
        'badge-contract-text': '#4A5A28',
        'badge-dept-bg': '#DDE3C4',
        'badge-dept-text': '#3D4F1E',
        'danger-reject': '#B94040',
        'toast-success-bg': '#6B7C3F',
        // Custom premium plans colors
        'gold': '#D4AF37',
        'silver': '#C0C0C0',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

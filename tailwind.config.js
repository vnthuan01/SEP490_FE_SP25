/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core brand palette (aligned với Tailwind)
        primary: '#60A5FA', // blue-400
        'primary-hover': '#2563EB', // blue-600
        accent: '#FACC15', // yellow-400
        'accent-hover': '#EAB308', // yellow-500
        success: '#86EFAC', // green-300

        // Semantic backgrounds & text (light / dark)
        'background-light': '#f6f7f8', // From HTML template
        'background-dark': '#101922', // From HTML template
        'surface-light': '#FFFFFF',
        'surface-dark': '#1C242D', // From HTML template
        'surface-dark-highlight': '#283039', // From HTML template
        'header-light': '#FFFFFF',
        'header-dark': '#101922', // Match background-dark
        'sub-surface-light': '#F9FAFB',
        'sub-surface-dark': '#1C242D',

        // Text
        'text-main-light': '#1E3A8A', // hơi xanh dương
        'text-muted-light': '#3B82F6', // xanh nhạt hơn
        'text-main-dark': '#DBEAFE', // nền tối chữ hơi xanh
        'text-muted-dark': '#93C5FD', // chữ phụ nền dark
        'text-sub-light': '#6B7280', // gray-500
        'text-sub-dark': '#9CA3AF', // gray-400

        // Cards
        'card-light': '#FFFFFF',
        'card-dark': '#1C242D', // Match surface-dark

        // Borders
        'border-dark': '#3b4754',

        // Status colors
        danger: '#EF4444', // red-500
        warning: '#FACC15', // yellow-400
        info: '#60A5FA', // blue-400

        // Legacy colors (keep for backward compatibility if needed, though strictly we should use the new ones)
        title: '#000000',
        lightText: '#8D8D8D',
      },
      fontFamily: {
        display: ['"Public Sans"', 'sans-serif'],
        body: ['"Noto Sans"', '"Public Sans"', 'sans-serif'],
        sans: ['"Public Sans"', '"Noto Sans"', 'sans-serif'],
        jersey25: ['"Jersey 25"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      maxWidth: {
        content: '1200px',
      },
      width: {
        sidebar: '256px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};

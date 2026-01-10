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
        backgroundLight: '#F9FAFB', // gray-50
        backgroundDark: '#020617', // slate-950
        surfaceLight: '#FFFFFF',
        surfaceDark: '#020617',
        headerLight: '#FFFFFF',
        headerDark: '#020617',
        subSurfaceLight: '#F9FAFB',
        subSurfaceDark: '#020617',

        // Text
        MainLight: '#1E3A8A', // hơi xanh dương
        textMutedLight: '#3B82F6', // xanh nhạt hơn
        textMainDark: '#DBEAFE', // nền tối chữ hơi xanh
        textMutedDark: '#93C5FD', // chữ phụ nền dark
        textSubLight: '#6B7280', // gray-500
        textSubDark: '#9CA3AF', // gray-400

        // Cards
        cardLight: '#FFFFFF',
        cardDark: '#020617',

        // Core brand palette
        // primary: '#60A5FA', // blue-400
        // primaryHover: '#2563EB', // blue-600
        // accent: '#FACC15', // yellow-400
        // accentHover: '#EAB308', // yellow-500
        // success: '#86EFAC',

        // Status colors
        danger: '#EF4444', // red-500
        warning: '#FACC15', // yellow-400
        info: '#60A5FA', // blue-400

        // Legacy colors (keep for backward compatibility)
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

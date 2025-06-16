/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#F5F7FF', // Lightest primary shade - indigo-50
          100: '#E0E7FF', // Light primary shade - indigo-100
          200: '#C7D2FE', // Light primary shade - indigo-200
          300: '#A5B4FC', // Light primary shade - indigo-300
          400: '#818CF8', // Medium primary shade - indigo-400
          500: '#6366F1', // Medium primary shade - indigo-500
          600: '#4F46E5', // Primary brand color - indigo-600
          700: '#4338CA', // Dark primary shade - indigo-700
          800: '#3730A3', // Dark primary shade - indigo-800
          900: '#312E81', // Darkest primary shade - indigo-900
          DEFAULT: '#4F46E5', // Primary actions, key interactive elements, and brand identity - indigo-600
          hover: '#4338CA', // Hover state for primary buttons and interactive elements - indigo-700
          light: '#E0E7FF', // Backgrounds for selected items, highlights, and secondary indicators - indigo-100
        },
        'background': '#FFFFFF', // Main application background - white
        'surface': '#F9FAFB', // Card backgrounds, secondary surfaces - gray-50
        'border': '#E5E7EB', // Subtle borders and dividers - gray-200
        'border-strong': '#D1D5DB', // More prominent borders for form elements - gray-300
        'text-primary': '#111827', // Primary text content - gray-900
        'text-secondary': '#4B5563', // Secondary text, descriptions, and labels - gray-600
        'text-tertiary': '#9CA3AF', // Placeholder text and disabled states - gray-400
        'success': '#059669', // Success states, confirmations, and positive actions - emerald-600
        'success-light': '#ECFDF5', // Background for success messages and indicators - emerald-50
        'warning': '#F59E0B', // Warning states and cautionary indicators - amber-500
        'warning-light': '#FFFBEB', // Background for warning messages - amber-50
        'error': '#DC2626', // Error states, destructive actions, and critical alerts - red-600
        'error-light': '#FEF2F2', // Background for error messages - red-50
        'info': '#2563EB', // Informational states and neutral indicators - blue-600
        'info-light': '#EFF6FF', // Background for informational messages - blue-50
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}
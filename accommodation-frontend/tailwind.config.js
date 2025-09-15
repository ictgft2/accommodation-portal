/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from your Figma design
        primary: {
          50: '#e6f3ff',
          100: '#b3d9ff',
          500: '#1e5a96', // Main blue from title
          600: '#164a7a',
          700: '#0f3b5e',
          800: '#082c42',
          900: '#041d26',
        },
        accent: {
          red: '#ff0000', // Red CTA button
          yellow: '#fbbf24', // Sign Up button yellow
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'], // For the main title
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, rgba(30, 90, 150, 0.8) 0%, rgba(59, 130, 246, 0.6) 100%)',
        'hero-overlay': 'linear-gradient(to bottom, rgba(30, 90, 150, 0.7), rgba(8, 44, 66, 0.8))',
      },
    },
  },
  plugins: [],
}
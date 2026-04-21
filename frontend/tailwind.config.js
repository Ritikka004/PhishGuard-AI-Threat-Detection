/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e17',
        surface: '#121826',
        primary: '#3b82f6', // blue
        safe: '#10b981', // green
        suspicious: '#f59e0b', // yellow
        dangerous: '#ef4444', // red
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(59, 130, 246, 0.5)',
        'glow-safe': '0 0 15px rgba(16, 185, 129, 0.5)',
        'glow-suspicious': '0 0 15px rgba(245, 158, 11, 0.5)',
        'glow-dangerous': '0 0 15px rgba(239, 68, 68, 0.5)',
      }
    },
  },
  plugins: [],
}

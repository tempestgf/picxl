/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Change from 'media' to 'class' to support manual toggling
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rojo: {
          50: '#FFE5E5',    // Rojo extra claro
          100: '#FFB2B2',   // Rojo claro
          200: '#FF8080',   // Rojo suave
          300: '#FF4D4D',   // Rojo moderado
          400: '#FF1A1A',   // Rojo intenso
          DEFAULT: '#D80000', // Rojo principal
          600: '#B30000',   // Rojo profundo
          700: '#8E0000',   // Rojo oscuro
          800: '#6A0000',   // Rojo muy oscuro
          900: '#450000',   // Rojo ultra oscuro
        },
        // Negro suavizado para evitar contrastes extremos
        negro: '#222222',
        // Blanco puro para mantener la claridad sin tono grisáceo
        blanco: '#FFFFFF',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        brand: "#14532d",
        accent: "#0f766e"
      }
    }
  },
  plugins: []
};

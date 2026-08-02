/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        spaceBlack: "#050505",
        spaceCard: "#0a0a0f",
        neonPurple: "#b026ff",
        electricBlue: "#00f0ff",
        brand: "#14532d",
        accent: "#0f766e",
        cryptoYellow: "#ffd13b",
        cryptoBlack: "#111111",
        cryptoBeige: "#e5e3db"
      },
      boxShadow: {
        'neo-out': '-4px -4px 10px rgba(0, 240, 255, 0.1), 4px 4px 10px rgba(176, 38, 255, 0.1)',
        'neo-in': 'inset -4px -4px 10px rgba(0, 240, 255, 0.1), inset 4px 4px 10px rgba(176, 38, 255, 0.1)',
        'neo-glow-blue': '0 0 15px rgba(0, 240, 255, 0.5)',
        'neo-glow-purple': '0 0 15px rgba(176, 38, 255, 0.5)',
        'neo-card': '-8px -8px 16px rgba(0, 240, 255, 0.05), 8px 8px 16px rgba(176, 38, 255, 0.05)',
        'crypto-card': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 20px rgba(0,0,0,0.05)',
        'crypto-container': '0 30px 60px rgba(0,0,0,0.2)',
      }
    }
  },
  plugins: []
};

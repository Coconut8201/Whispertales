/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 兒童友好色彩系統
        children: {
          primary: {
            DEFAULT: "#ff6b6b",
            light: "#ff8a80",
            dark: "#ff5252",
          },
          secondary: {
            DEFAULT: "#4ecdc4",
            light: "#80cbc4",
            dark: "#26a69a",
          },
          accent: {
            DEFAULT: "#ffd93d",
            light: "#ffeb99",
            dark: "#ffc107",
          },
          success: {
            DEFAULT: "#6bcf7f",
            light: "#a5d6a7",
            dark: "#4caf50",
          },
          warning: {
            DEFAULT: "#ffb347",
            light: "#ffcc80",
            dark: "#ffa726",
          },
          info: {
            DEFAULT: "#74b9ff",
            light: "#90caf9",
            dark: "#42a5f5",
          },
          bg: {
            primary: "#fff9f9",
            secondary: "#f0fcfc",
            card: "#ffffff",
          },
          text: {
            primary: "#2d3436",
            secondary: "#636e72",
            white: "#ffffff",
          },
        },
      },
      borderRadius: {
        "children-sm": "12px",
        "children-md": "16px",
        "children-lg": "24px",
        "children-xl": "32px",
      },
      boxShadow: {
        "children-soft": "0 4px 12px rgba(0, 0, 0, 0.1)",
        "children-medium": "0 8px 24px rgba(0, 0, 0, 0.15)",
        "children-strong": "0 12px 32px rgba(0, 0, 0, 0.2)",
      },
      fontSize: {
        "children-xl": "24px",
        "children-lg": "20px",
        "children-md": "18px",
        "children-sm": "16px",
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
    },
  },
  plugins: [],
};

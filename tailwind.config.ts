import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E8C97A",
          dark: "#9A7A2E"
        },
        brand: {
          bg: "#FAFAF8",
          surface: "#FFFFFF",
          border: "#E8E5DF"
        },
        ink: {
          primary: "#1A1814",
          secondary: "#6B6560",
          muted: "#A09890"
        }
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["DM Sans", "Helvetica Neue", "sans-serif"]
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out"
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" }
        },
        slideUp: {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" }
        },
        fadeIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" }
        }
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};

export default config;

import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Poppins", "Inter", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        primary: "hsl(var(--primary))",
        accent: "hsl(var(--accent))",
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 197, 94, 0.28)",
      },
      animation: {
        "fade-rise": "fade-rise 0.8s ease-out both",
        "fade-rise-delay": "fade-rise 0.8s ease-out 0.2s both",
        "fade-rise-delay-2": "fade-rise 0.8s ease-out 0.4s both",
        float: "float 7s ease-in-out infinite",
      },
      keyframes: {
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          "50%": { transform: "translate3d(8px, -14px, 0) rotate(4deg)" },
        },
      },
    },
  },
  plugins: [animate],
} satisfies Config;

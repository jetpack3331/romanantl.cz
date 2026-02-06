import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        home: "url('/bg.png')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      colors: {
        pastel: {
          cream: "#F4F5F0",
          sand: "#E3E8DC",
          sage: "#B8C4AA",
          accent: "#7D9B69",
          "accent-hover": "#6A8558",
          dark: "#1C2318",
          "dark-secondary": "#2A3324",
          "dark-accent": "#8FA87A",
        },
        pricing: {
          starter: "#E2E8ED",
          standard: "#E2EDE2",
          premium: "#EDE2E2",
          retainer: "#4A6B5A",
        },
      },
      borderRadius: {
        card: "1rem",
        btn: "0.75rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(0,0,0,0.08)",
        "soft-lg": "0 8px 24px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};

export default config;

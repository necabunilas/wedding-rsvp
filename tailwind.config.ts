import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wedding: {
          gold: "#E0A55B",
          "gold-light": "#F5E6D3",
          wine: "#5A0F2E",
          "wine-light": "#8B2D4D",
          black: "#000000",
          white: "#FFFFFF",
          charcoal: "#1A1A1A",
          gray: "#B3B3B3",
          "off-white": "#F7F7F7",
          cream: "#FDF9F3",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

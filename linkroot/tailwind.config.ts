import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f0ff",
          100: "#e6e2ff",
          200: "#c9c0ff",
          300: "#a996ff",
          400: "#8a68ff",
          500: "#7141ff",
          600: "#611fef",
          700: "#5116c9",
          800: "#4313a1",
          900: "#38127f",
        },
      },
    },
  },
  plugins: [],
};

export default config;


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
          dark: "#123847",
          teal: "#1F4E5F",
          green: "#2E7A63",
          mint: "#6FD3A8",
          amber: "#B7791F",
        },
      },
    },
  },
  plugins: [],
};
export default config;
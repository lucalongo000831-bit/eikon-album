import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif"
        ],
        editorial: [
          "Georgia",
          "Times New Roman",
          "serif"
        ]
      },
      boxShadow: {
        folder: "0 10px 22px rgba(15, 23, 42, 0.14)",
        "folder-hover": "0 16px 28px rgba(15, 23, 42, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;

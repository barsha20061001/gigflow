/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f4",
          100: "#d7eee4",
          500: "#1f9a6d",
          600: "#167c58",
          700: "#125f45"
        }
      }
    }
  },
  plugins: []
};

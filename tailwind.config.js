/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spark: {
          primary: "#063D35",
          secondary: "#7FCFC0",
          tertiary: "#B8F2E6",
          neutral: "#F7FAF9",
        },
      },
    },
  },
  plugins: [],
};
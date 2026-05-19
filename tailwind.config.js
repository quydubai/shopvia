/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        primary: ['"Saira Semi Condensed"', 'sans-serif'],
      },
      colors: {
        brand: {
          text: '#39404a',
          light: '#f1f1f1',
          muted: '#555555',
          accent: '#587d9f',
          black: '#000000',
          orange: '#eb542a',
          raised: '#f5f6f7',
        },
      },
    },
  },
  plugins: [],
}

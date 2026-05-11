/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Fox Hill–inspired palette. Tweak in one place; everything else references these tokens.
      colors: {
        fox: {
          // Primary warm yellow/gold
          yellow: {
            50: "#FFFBEB",
            100: "#FEF3C7",
            300: "#FCD34D",
            500: "#F5B82E", // primary brand
            600: "#D99B14",
            700: "#A6760A",
          },
          // Deep navy for headings + structure
          navy: {
            500: "#1E3A5F",
            700: "#13294A",
            900: "#0A1A33",
          },
          // Warm cream backgrounds
          cream: {
            50: "#FFFCF5",
            100: "#FBF5E6",
            200: "#F2E9D0",
          },
          ink: "#2C2A26", // body text charcoal
        },
        // Traditional mahjong tile accents
        tile: {
          bone: "#F4ECD6",
          jade: "#0F8A5F",
          red: "#B8302A",
          blue: "#1F5BA8",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        body: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "tile-pattern": "url('/tile-pattern.svg')",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-color": "var(--primary-color)",
        "secondary-color": "var(--secondary-color)",
        "success-color": "var(--success-color)",
        "warning-color": "var(--warning-color)",
        "info-color": "var(--info-color)",
        "danger-color": "var(--danger-color)",
        "text-primary-color": "var(--text-primary-color)",
        "header-color": "var(--header-color)",
        "header-text-color": "var(--header-text-color)",
        "background-color": "var(--background-color)",
      },
      fontFamily: {
        brume: ["Brume"],
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
};

module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {},
    },
    plugins: [
      require('@tailwindcss/forms'), // improves default form element styling
    ],
  };
  
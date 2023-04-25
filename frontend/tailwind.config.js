/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    ...[
      // <MdPlayCircle className="color-black w-12 h-12 bg-white p-px rounded-full"></MdPlayCircle>
      "color-black",
      "w-12",
      "h-12",
      "bg-white",
      "p-px",
      "rounded-full",
    ],
  ],
};

/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  corePlugins: {
    space: false,
  },
  theme: {
    // NOTE to AI: You can extend the theme with custom colors or styles here.
    extend: {
      // For example, you can add a primary or secondary color here.
      // colors: {
      //   primary: "#INSERT_VALID_HEX_CODE",
      //   secondary: "#INSERT_VALID_HEX_CODE",
      // },
      fontFamily: {
        sans: ["-apple-system", "SF Pro Text", "SF Pro Display", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "16px", letterSpacing: "0.07px" }],
        sm: ["13px", { lineHeight: "18px", letterSpacing: "-0.08px" }],
        base: ["17px", { lineHeight: "22px", letterSpacing: "-0.41px" }],
        lg: ["19px", { lineHeight: "24px", letterSpacing: "-0.45px" }],
        xl: ["21px", { lineHeight: "26px", letterSpacing: "-0.5px" }],
        "2xl": ["24px", { lineHeight: "30px", letterSpacing: "-0.6px" }],
        "3xl": ["28px", { lineHeight: "34px", letterSpacing: "-0.7px" }],
        "4xl": ["34px", { lineHeight: "41px", letterSpacing: "-0.85px" }],
        "5xl": ["40px", { lineHeight: "48px", letterSpacing: "-1px" }],
        "6xl": ["48px", { lineHeight: "56px", letterSpacing: "-1.2px" }],
        "7xl": ["56px", { lineHeight: "64px", letterSpacing: "-1.4px" }],
        "8xl": ["64px", { lineHeight: "72px", letterSpacing: "-1.6px" }],
        "9xl": ["72px", { lineHeight: "80px", letterSpacing: "-1.8px" }],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
    },
  },
  darkMode: "class",
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      const spacing = theme("spacing");

      // space-{n}  ->  gap: {n}
      matchUtilities(
        { space: (value) => ({ gap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );

      // space-x-{n}  ->  column-gap: {n}
      matchUtilities(
        { "space-x": (value) => ({ columnGap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );

      // space-y-{n}  ->  row-gap: {n}
      matchUtilities(
        { "space-y": (value) => ({ rowGap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );
    }),
  ],
};

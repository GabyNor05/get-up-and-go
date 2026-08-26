const sharedTheme = require('../../packages/shared-ui/shared-theme.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "../../packages/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        gng: {
          bg: "var(--gng-bg)",
          surface: "var(--gng-surface)",
          surfaceRaised: "var(--gng-surface-raised)",
          text: "var(--gng-text)",
          muted: "var(--gng-text-muted)",
          border: "var(--gng-border)",
          primary: {
            DEFAULT: "var(--gng-primary)",
            shade: "var(--gng-primary-shade)",
            deepShade: "var(--gng-primary-deep-shade)",
            tint: "var(--gng-primary-tint)",
            tint2: "var(--gng-primary-tint2)",
          },
          accent: {
            DEFAULT: "var(--gng-accent)",
            shade: "var(--gng-accent-shade)",
            deepShade: "var(--gng-accent-deep-shade)",
            tint: "var(--gng-accent-tint)",
            tint2: "var(--gng-accent-tint2)",
          },
        },
      },
      fontFamily: {
        heading: ["ADayWithoutSun", "sans-serif"],
        body: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
}

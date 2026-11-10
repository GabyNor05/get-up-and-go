const sharedTheme = require('../../packages/shared-ui/shared-theme.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../../packages/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Semantic colours resolve to the CSS variables in packages/shared-ui/shared-ui.css
      colors: sharedTheme.tailwindColors,
      fontFamily: {
        display: [sharedTheme.fonts.display, 'sans-serif'],
        heading: [sharedTheme.fonts.display, 'sans-serif'],
        body: [sharedTheme.fonts.body, 'sans-serif'],
      },
      borderRadius: {
        card: `${sharedTheme.radius.lg}px`,
        sheet: `${sharedTheme.radius.xl}px`,
      },
    },
  },
  plugins: [],
};

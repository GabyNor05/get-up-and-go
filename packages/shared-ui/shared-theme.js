/**
 * Get Up & Go — design tokens (single source of truth).
 * Values come from claude/DESIGN_DECISIONS.md. Mobile reads them through
 * `tokens.ts`, web through `shared-ui.css` (CSS variables) and `daisyTheme`.
 */

const palette = {
  indigo: { 900: '#352C53', 700: '#5B4C9E', 500: '#A88AED', 300: '#CDBDF6', 100: '#ECE4FC' },
  celery: { 900: '#36421B', 700: '#5F7330', 500: '#A6C261', 300: '#C9DB9A', 100: '#E9F2D3' },
  beige: { 900: '#24221B', 700: '#605E55', 500: '#F4F0DD', 300: '#FAF8F0' },
  charcoal: '#1A1A1A',
  white: '#FFFFFF',
};

const category = {
  NATURE: '#A6C261',
  MUSIC: '#A88AED',
  GAMES: '#E87D6C',
  FAMILY: '#E8A84C',
  FOOD: '#6CB8E8',
  SPORT: '#7DC98A',
  COMMUNITY: '#A88AED',
  ALL: '#A88AED',
};

const semantic = {
  light: {
    bgCanvas: '#F4F0DD',
    bgSurface: '#FAF8F0',
    bgElevated: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#605E55',
    textBrand: '#5B4C9E',
    textProgress: '#5F7330',
    actionPrimary: '#5B4C9E',
    onActionPrimary: '#FFFFFF',
    actionSecondary: '#A6C261',
    onActionSecondary: '#24221B',
    fillBrandSubtle: '#ECE4FC',
    fillProgressSubtle: '#E9F2D3',
    borderSubtle: '#E2DCC4',
    borderStrong: '#605E55',
    focusRing: '#5B4C9E',
    danger: '#A9483A',
    fillDangerSubtle: '#FBE1DC',
  },
  dark: {
    bgCanvas: '#1A1A1A',
    bgSurface: '#24221B',
    bgElevated: '#2E2B23',
    textPrimary: '#FAF8F0',
    textSecondary: '#BDB8A6',
    textBrand: '#CDBDF6',
    textProgress: '#C9DB9A',
    actionPrimary: '#A88AED',
    onActionPrimary: '#1A1A1A',
    actionSecondary: '#A6C261',
    onActionSecondary: '#24221B',
    fillBrandSubtle: '#352C53',
    fillProgressSubtle: '#36421B',
    borderSubtle: '#3A372D',
    borderStrong: '#8A8576',
    focusRing: '#CDBDF6',
    danger: '#F0A396',
    fillDangerSubtle: '#4A221C',
  },
};

const fonts = {
  display: 'Fredoka-SemiBold',
  body: 'Arial',
};

const typeScale = {
  displayXl: { fontSize: 40, lineHeight: 44 },
  displayLg: { fontSize: 32, lineHeight: 36 },
  title: { fontSize: 24, lineHeight: 28 },
  heading: { fontSize: 20, lineHeight: 24 },
  bodyLg: { fontSize: 17, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
};

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32, '4xl': 48 };
const radius = { sm: 8, md: 12, lg: 20, xl: 28, pill: 999 };

/** kebab-case CSS variable name for a semantic key, e.g. bgCanvas -> --gng-bg-canvas */
const cssVar = (key) => `--gng-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;

/** Tailwind colours that resolve to the CSS variables in shared-ui.css */
const tailwindColors = {
  gng: Object.fromEntries(
    Object.keys(semantic.light).map((key) => [key, `var(${cssVar(key)})`]),
  ),
  category,
};

/** DaisyUI theme for the web portal */
const daisyTheme = {
  gng: {
    primary: semantic.light.actionPrimary,
    'primary-content': semantic.light.onActionPrimary,
    secondary: semantic.light.actionSecondary,
    'secondary-content': semantic.light.onActionSecondary,
    accent: palette.indigo[500],
    neutral: palette.beige[900],
    'base-100': semantic.light.bgCanvas,
    'base-200': semantic.light.bgSurface,
    'base-300': semantic.light.borderSubtle,
    'base-content': semantic.light.textPrimary,
    error: semantic.light.danger,
  },
};

module.exports = {
  palette,
  category,
  semantic,
  fonts,
  typeScale,
  spacing,
  radius,
  cssVar,
  tailwindColors,
  daisyTheme,
};

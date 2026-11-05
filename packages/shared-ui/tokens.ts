/**
 * Typed access to the G&G design tokens for React Native StyleSheet code.
 * Values live in shared-theme.js (also used by Tailwind and the web portal).
 */

export type SemanticTokens = {
  bgCanvas: string;
  bgSurface: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
  textBrand: string;
  textProgress: string;
  actionPrimary: string;
  onActionPrimary: string;
  actionSecondary: string;
  onActionSecondary: string;
  fillBrandSubtle: string;
  fillProgressSubtle: string;
  borderSubtle: string;
  borderStrong: string;
  focusRing: string;
  danger: string;
  fillDangerSubtle: string;
};

export type ColorScheme = 'light' | 'dark';

export type CategoryKey =
  | 'NATURE'
  | 'MUSIC'
  | 'GAMES'
  | 'FAMILY'
  | 'FOOD'
  | 'SPORT'
  | 'COMMUNITY'
  | 'ALL';

interface TypeStyle {
  fontSize: number;
  lineHeight: number;
}

interface GngTheme {
  palette: {
    indigo: Record<100 | 300 | 500 | 700 | 900, string>;
    celery: Record<100 | 300 | 500 | 700 | 900, string>;
    beige: Record<300 | 500 | 700 | 900, string>;
    charcoal: string;
    white: string;
  };
  category: Record<CategoryKey, string>;
  semantic: Record<ColorScheme, SemanticTokens>;
  fonts: { display: string; body: string };
  typeScale: Record<
    'displayXl' | 'displayLg' | 'title' | 'heading' | 'bodyLg' | 'body' | 'label' | 'caption',
    TypeStyle
  >;
  spacing: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl', number>;
  radius: Record<'sm' | 'md' | 'lg' | 'xl' | 'pill', number>;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const theme: GngTheme = require('./shared-theme.js');

export const palette = theme.palette;
export const categoryColors = theme.category;
export const semantic = theme.semantic;
export const fonts = theme.fonts;
export const typeScale = theme.typeScale;
export const spacing = theme.spacing;
export const radius = theme.radius;

export const shadows = {
  card: {
    shadowColor: '#24221B',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  float: {
    shadowColor: '#24221B',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;

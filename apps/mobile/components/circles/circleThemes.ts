/** Colour choices for a Circle card. Accents are decoration only (never text). */
export interface CircleTheme {
  accent: string;
  light: string;
  dark: string;
}

export const CIRCLE_THEMES: CircleTheme[] = [
  { accent: '#A88AED', light: '#ECE4FC', dark: '#352C53' },
  { accent: '#A6C261', light: '#E9F2D3', dark: '#36421B' },
  { accent: '#E8A84C', light: '#FDF0DA', dark: '#3D2E14' },
  { accent: '#6CB8E8', light: '#E1F1FB', dark: '#1E2B35' },
  { accent: '#E87D6C', light: '#FBE4E0', dark: '#3A2320' },
  { accent: '#7DC98A', light: '#E3F4E6', dark: '#203024' },
];

export const CIRCLE_EMOJIS = ['🌸', '🥾', '🎷', '⚡', '🏡', '🧘', '⛰️', '📚', '⚽', '🚴', '🎨', '🎮', '🍜', '🌊'];

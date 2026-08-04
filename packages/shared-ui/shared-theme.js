/** @type {import('tailwindcss').Config['theme']} */

const PALETTE = {
  light: {
    bg: "c",
    surface: "#FAF8F0",
    surfaceRaised: "#FFFFFF",
    text: "#24221B",
    textMuted: "#605E55",
    primary: "#A88AED",
    primaryShade: "#352C53",
    primaryDeepShade: "#64539E",
    primaryTint: "#CBB9F4",
    primaryTint2: "#ECE4FC",
    accent: "#A6C261",
    accentShade: "#6D843D",
    accentDeepShade: "#36421B",
    accentTint: "#C5D993",
    accentTint2: "#E9F2D3",
    border: "rgba(36,34,27,0.10)",
  },
  dark: {
    bg: "#1A1A1A",
    surface: "#24221B",
    surfaceRaised: "#2D2B22",
    text: "#FAF8F0",
    textMuted: "#B8B6AC",
    primary: "#A88AED",
    primaryShade: "#ECE4FC",
    primaryDeepShade: "#CBB9F4",
    primaryTint: "#64539E",
    primaryTint2: "#352C53",
    accent: "#A6C261",
    accentShade: "#C5D993",
    accentDeepShade: "#E9F2D3",
    accentTint: "#6D843D",
    accentTint2: "#36421B",
    border: "rgba(250,248,240,0.12)",
  },
};

module.exports = {
  colors: {
    gng: {
      // Light Mode Tokens
      bg: {
        light: PALETTE.light.bg,
        dark: PALETTE.dark.bg,
      },
      surface: {
        light: PALETTE.light.surface,
        dark: PALETTE.dark.surface,
      },
      surfaceRaised: {
        light: PALETTE.light.surfaceRaised,
        dark: PALETTE.dark.surfaceRaised,
      },
      text: {
        light: PALETTE.light.text,
        dark: PALETTE.dark.text,
        mutedLight: PALETTE.light.textMuted,
        mutedDark: PALETTE.dark.textMuted,
      },
      border: {
        light: PALETTE.light.border,
        dark: PALETTE.dark.border,
      },

      // Brand Colors (Light / Dark mapped)
      primary: {
        DEFAULT: PALETTE.light.primary,
        shade: {
          light: PALETTE.light.primaryShade,
          dark: PALETTE.dark.primaryShade,
        },
        deepShade: {
          light: PALETTE.light.primaryDeepShade,
          dark: PALETTE.dark.primaryDeepShade,
        },
        tint: {
          light: PALETTE.light.primaryTint,
          dark: PALETTE.dark.primaryTint,
        },
        tint2: {
          light: PALETTE.light.primaryTint2,
          dark: PALETTE.dark.primaryTint2,
        },
      },
      accent: {
        DEFAULT: PALETTE.light.accent,
        shade: {
          light: PALETTE.light.accentShade,
          dark: PALETTE.dark.accentShade,
        },
        deepShade: {
          light: PALETTE.light.accentDeepShade,
          dark: PALETTE.dark.accentDeepShade,
        },
        tint: {
          light: PALETTE.light.accentTint,
          dark: PALETTE.dark.accentTint,
        },
        tint2: {
          light: PALETTE.light.accentTint2,
          dark: PALETTE.dark.accentTint2,
        },
      },
    },
  },

  fontFamily: {
    heading: ['"A Day Without Sun"', 'sans-serif'],
    sans: ['Arial', 'sans-serif'],
    body: ['Arial', 'sans-serif'],
  },

  fontSize: {
    display: ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }], // 36px
    h1: ['1.75rem', { lineHeight: '2.125rem', letterSpacing: '-0.01em' }],   // 28px
    h2: ['1.375rem', { lineHeight: '1.75rem' }],                            // 22px
    h3: ['1.125rem', { lineHeight: '1.5rem' }],                             // 18px
    'body-lg': ['1rem', { lineHeight: '1.5rem' }],                            // 16px
    body: ['0.938rem', { lineHeight: '1.375rem' }],                         // 15px
    caption: ['0.813rem', { lineHeight: '1.125rem' }],                      // 13px
    tiny: ['0.688rem', { lineHeight: '0.875rem' }],                         // 11px
  },
};
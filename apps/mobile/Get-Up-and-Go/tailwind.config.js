/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  content: [
    './apps/web/src/**/*.{js,jsx,ts,tsx}',
    './apps/mobile/src/**/*.{js,jsx,ts,tsx}',
    './packages/shared-ui/src/**/*.{js,jsx,ts,tsx}',
  ],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // ==========================================
      // FONT FAMILIES
      // ==========================================
      fontFamily: {
        // App name & Header 1 font
        // Note: Ensure 'ADayWithoutSun' (or exact file/postscript name) is loaded in Expo/Web
        heading: ['"A Day Without Sun"', 'sans-serif'], 
        
        // Default body font for all other text
        sans: ['Arial', 'sans-serif'],
        body: ['Arial', 'sans-serif'],
      },

      // ==========================================
      // TYPE SCALE (Mobile & Web Friendly)
      // [fontSize, { lineHeight, letterSpacing }]
      // ==========================================
      fontSize: {
        'display': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }], // 36px - App Name / Large Titles
        'h1': ['1.75rem', { lineHeight: '2.125rem', letterSpacing: '-0.01em' }],   // 28px - Screen Headers (H1)
        'h2': ['1.375rem', { lineHeight: '1.75rem' }],                            // 22px - Section Headers (H2)
        'h3': ['1.125rem', { lineHeight: '1.5rem' }],                             // 18px - Sub-headers / Card Titles
        'body-lg': ['1rem', { lineHeight: '1.5rem' }],                            // 16px - Prominent Body
        'body': ['0.938rem', { lineHeight: '1.375rem' }],                         // 15px - Default App Body Text
        'caption': ['0.813rem', { lineHeight: '1.125rem' }],                      // 13px - Captions / Muted Subtext
        'tiny': ['0.688rem', { lineHeight: '0.875rem' }],                         // 11px - Badges / Status Labels
      },

      // ==========================================
      // G&G COLOR SYSTEM
      // ==========================================
      colors: {
        gng: {
          bg: {
            light: '#F4F0DD',
            dark: '#1A1A1A',
          },
          surface: {
            light: '#FAF8F0',
            dark: '#24221B',
            raised: {
              light: '#FFFFFF',
              dark: '#2D2B22',
            },
          },
          text: {
            DEFAULT: '#24221B',
            dark: '#FAF8F0',
            muted: {
              DEFAULT: '#605E55',
              dark: '#B8B6AC',
            },
          },
          primary: {
            DEFAULT: '#A88AED',
            shade: {
              light: '#352C53',
              dark: '#ECE4FC',
            },
            deepShade: {
              light: '#64539E',
              dark: '#CBB9F4',
            },
            tint: {
              light: '#CBB9F4',
              dark: '#64539E',
            },
            tint2: {
              light: '#ECE4FC',
              dark: '#352C53',
            },
          },
          accent: {
            DEFAULT: '#A6C261',
            shade: {
              light: '#6D843D',
              dark: '#C5D993',
            },
            deepShade: {
              light: '#36421B',
              dark: '#E9F2D3',
            },
            tint: {
              light: '#C5D993',
              dark: '#6D843D',
            },
            tint2: {
              light: '#E9F2D3',
              dark: '#36421B',
            },
          },
          nav: {
            light: '#1A1A1A',
            dark: '#000000',
          },
          border: {
            light: 'rgba(36, 34, 27, 0.10)',
            dark: 'rgba(250, 248, 240, 0.12)',
          },
        },
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
}
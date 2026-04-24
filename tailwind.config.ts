import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Kultiva design system — aligned with the kultiva.app presentation site
        brand: {
          DEFAULT: '#4A9B5A',
          dark: '#357A44',
          soft: '#BCE5C1',
          mint: '#A8D5A2',
        },
        terracotta: {
          DEFAULT: '#D8A881',
          deep: '#D17A4E',
          dark: '#B86036',
          soft: '#F8CBA6',
        },
        butter: {
          DEFAULT: '#FFE7A0',
          soft: '#FFF3D0',
        },
        spring: '#FBD8E6',
        sky: {
          DEFAULT: '#E0EEFB',
          muted: '#C6D8E3',
        },
        cream: {
          warm: '#FAF3DE',
          surface: '#FFF8E8',
          DEFAULT: '#F3EDD8',
        },
        fg: {
          DEFAULT: '#3D4A3F',
          muted: '#6B7A6F',
          subtle: '#8E9C92',
        },
        'ink-deep': '#2A3A2E',

        // Legacy aliases — remapped onto the new palette so existing
        // pages keep working while they migrate to the new tokens.
        kawaii: {
          pink: {
            50: '#FDF4EC',
            100: '#FCE7D5',
            200: '#F8CBA6',
            300: '#EBAD7E',
            400: '#DE8F64',
            500: '#D17A4E',
            600: '#B86036',
          },
          green: {
            50: '#F1F8F2',
            100: '#DDEEE0',
            200: '#BCE5C1',
            300: '#8FD99C',
            400: '#6BC17C',
            500: '#4A9B5A',
            600: '#357A44',
          },
          cream: '#FAF3DE',
          ink: '#3D4A3F',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Baloo 2"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Nunito"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 24px -10px rgba(209, 122, 78, 0.30)',
        leaf: '0 12px 32px -10px rgba(74, 155, 90, 0.28)',
        card: '0 12px 32px rgba(0, 0, 0, 0.08)',
        logo: '0 6px 16px rgba(74, 155, 90, 0.25)',
      },
      borderRadius: {
        bubble: '1.75rem',
        pill: '999px',
      },
      backgroundImage: {
        'hero-blob':
          'radial-gradient(ellipse at top left, rgba(188,229,193,0.55), transparent 60%), radial-gradient(ellipse at bottom right, rgba(251,216,230,0.5), transparent 60%)',
      },
    },
  },
  plugins: [],
};
export default config;

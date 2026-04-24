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
        // Kultiva design system — 1:1 with colors_and_type.css
        sage: '#A8C3A0',
        brand: {
          DEFAULT: '#4A9B5A', // primary-green
          dark: '#2F7A3E',    // dark-green
          soft: '#A8D5A2',    // light-green
          mint: '#C8E6C9',    // mint-green
        },
        terracotta: {
          DEFAULT: '#E8A87C',
          deep: '#D17A4E',
          darker: '#B85A32',
          soft: '#F8CBA6', // autumn-a
        },
        blush: '#F4C2C2',
        butter: {
          DEFAULT: '#FFE8A3',
          soft: '#FFF3D0',
        },
        sky: {
          DEFAULT: '#7BAFD4',
          pastel: '#D6ECFA',
          muted: '#C6D8E3',
        },
        cream: {
          DEFAULT: '#FFF8E7',
          warm: '#FCF4E1',
          soft: '#F4E8D0',
          surface: '#F5FAF8',
        },
        fg: {
          DEFAULT: '#3D4A3D',
          muted: '#8AAB8A',
          subtle: '#6E7A6E',
          legal: '#8A8C80',
        },
        'ink-deep': '#2A3A2E',
        'dark-surface': '#1A2E22',

        // Seasonal gradient palette
        spring: { a: '#FBD8E6', b: '#BCE5C1' },
        summer: { a: '#FFE7A0', b: '#A8D5A2' },
        autumn: { a: '#F8CBA6', b: '#E8A87C' },
        winter: { a: '#E0EEFB', b: '#C6D8E3' },

        // Legacy aliases — map to the new palette so existing markup still renders
        kawaii: {
          pink: {
            50: '#FDF4EC',
            100: '#FCE7D5',
            200: '#F8CBA6',
            300: '#EBAD7E',
            400: '#E8A87C',
            500: '#D17A4E',
            600: '#B85A32',
          },
          green: {
            50: '#F1F8F2',
            100: '#DDEEE0',
            200: '#A8D5A2',
            300: '#8FD99C',
            400: '#6BC17C',
            500: '#4A9B5A',
            600: '#2F7A3E',
          },
          cream: '#FCF4E1',
          ink: '#3D4A3D',
        },
      },
      fontFamily: {
        display: ['"Fredoka"', '"Quicksand"', '"Nunito"', 'system-ui', 'sans-serif'],
        body: ['"Quicksand"', '"Nunito"', 'system-ui', 'sans-serif'],
        native: ['"Nunito"', '"Quicksand"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(40px, 6vw, 56px)', { lineHeight: '1.05' }],
        h1: ['32px', { lineHeight: '1.2' }],
        h2: ['24px', { lineHeight: '1.2' }],
        h3: ['20px', { lineHeight: '1.35' }],
        h4: ['17px', { lineHeight: '1.35' }],
        micro: ['11px', { lineHeight: '1.4' }],
      },
      boxShadow: {
        xs: '0 1px 2px rgba(74, 155, 90, 0.06)',
        soft: '0 10px 24px -8px rgba(209, 122, 78, 0.30)',
        leaf: '0 12px 32px -8px rgba(74, 155, 90, 0.28)',
        card: '0 4px 14px rgba(74, 155, 90, 0.12)',
        lg: '0 10px 26px rgba(0, 0, 0, 0.10)',
        xl: '0 14px 34px rgba(74, 155, 90, 0.15)',
        logo: '0 10px 30px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        xs: '8px',
        sm: '12px',
        md: '18px',
        lg: '20px',
        xl: '22px',
        '2xl': '28px',
        bubble: '20px',
        pill: '999px',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(.4, 0, .2, 1)',
        bounce: 'cubic-bezier(.34, 1.56, .64, 1)',
      },
    },
  },
  plugins: [],
};
export default config;

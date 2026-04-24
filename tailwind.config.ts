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
        // Kawaii pastel palette
        kawaii: {
          pink: {
            50: '#FFF5F8',
            100: '#FFE4EC',
            200: '#FFC9DA',
            300: '#FFA3C1',
            400: '#FF7BA8',
            500: '#FF5490',
            600: '#E63B77',
          },
          green: {
            50: '#F3FBF4',
            100: '#DFF5E2',
            200: '#BCEAC4',
            300: '#8FD99C',
            400: '#5FC476',
            500: '#3AAA58',
            600: '#2B8A45',
          },
          cream: '#FFFBF2',
          ink: '#3B2A3A',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(255, 123, 168, 0.25)',
        leaf: '0 6px 24px -8px rgba(95, 196, 118, 0.30)',
      },
      borderRadius: {
        bubble: '1.5rem',
      },
    },
  },
  plugins: [],
};
export default config;

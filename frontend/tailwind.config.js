/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        success: '#4EDEA3',
        warning: '#FBBF24',
        info: '#38BDF8',
        danger: '#FFB4AB',
        'dark-primary': '#4EDEA3',
        'dark-on-primary': '#003824',
        'dark-secondary-container': '#21523C',
        'dark-error-container': '#93000A',
        'dark-on-error-container': '#FFDAD6',
        'dark-surface': '#0E1511',
        'dark-surface-container-lowest': '#09100C',
        'dark-surface-container-low': '#161D19',
        'dark-surface-container': '#1A211D',
        'dark-surface-container-high': '#242C27',
        'dark-on-surface': '#DDE4DD',
        'dark-on-surface-variant': '#BBCABF',
        'dark-outline': '#86948A',
        'dark-outline-variant': '#3C4A42',
      },
      fontFamily: {
        headline: ['"Red Hat Text"', 'sans-serif'],
        body: ['"Instrument Sans"', 'sans-serif'],
        mono: ['"Source Code Pro"', 'monospace'],
      },
    },
  },
  plugins: [],
};

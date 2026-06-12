import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        espresso: '#211813',
        caramel: '#9b6235',
        cream: '#f4eadc',
        porcelain: '#fffaf3',
      },
    },
  },
  plugins: [],
};

export default config;

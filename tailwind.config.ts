import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        executado: {
          DEFAULT: '#22C55E',
          hover: '#86EFAC',
          border: '#16A34A',
        },
        baixa_confianca: '#F59E0B',
      },
    },
  },
  plugins: [],
}

export default config

import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        daangn: '#FF6F0F',
        bunjang: '#0055FF',
        joonggonara: '#00C73C',
      },
    },
  },
  plugins: [],
}

export default config

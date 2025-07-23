// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}", // include .ts and .tsx for React/TS
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config

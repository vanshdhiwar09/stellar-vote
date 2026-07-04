import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    // Required by Stellar SDK & Buffer polyfill in browser (Vite doesn't define global)
    global: 'globalThis',
  },
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ganti dengan nama repo kamu
export default defineConfig({
  base: '/ideal-music/',
  plugins: [react()],
})

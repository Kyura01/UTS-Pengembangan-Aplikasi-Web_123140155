// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Gunakan plugin react tanpa konfigurasi babel kustom
    react(), 
  ],
})
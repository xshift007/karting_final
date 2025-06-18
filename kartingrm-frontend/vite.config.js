// kartingrm-frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Todo lo que empiece con /api lo reenvía al backend
      '/api': {
        target: process.env.VITE_BACKEND_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // Opcional: elimina el prefijo /api en destino
        // rewrite: path => path               // <<— NO lo uses: tu backend sí expone /api
      }
    }
  }
})

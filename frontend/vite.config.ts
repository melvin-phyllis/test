import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    strictPort: true, // évite que Vite bascule tout seul sur 3001
    proxy: {
      // API FastAPI (HTTP). Mets ws:true si un jour tu fais des WS sous /api
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // ws: true,
      },
      // WebSocket FastAPI (tes endpoints /ws et /ws/:campaign_id)
      '/ws': {
        target: 'http://localhost:8000', // http suffit, ws sera upgradé
        ws: true,
        changeOrigin: true,
      },
      // (optionnel) si ton front appelle /health directement
      // '/health': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})

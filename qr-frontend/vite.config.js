import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',        // ← allows phone access on same WiFi
    proxy: {
      '/api': {
        target: 'http://192.168.1.26:5000',   // ← your backend
        changeOrigin: true,
      }
    }
  }
})
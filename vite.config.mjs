import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'BACKEND_URL')
  const proxy = {
    '/api': {
      target: process.env.BACKEND_URL || env.BACKEND_URL || 'http://localhost:3000',
      changeOrigin: true,
      ws: true,
      configure(proxy) {
        const setClientAddress = (proxyReq, req) => {
          proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress)
        }
        // Descarta IPs inventadas por el cliente
        proxy.on('proxyReq', setClientAddress)
        proxy.on('proxyReqWs', setClientAddress)
      },
    },
  }

  return {
    plugins: [vue()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { port: 8080, strictPort: true, proxy },
    preview: { port: 4173, strictPort: true, proxy },
  }
})

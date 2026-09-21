const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
        // Vue actúa como proxy al ejecutar npm run serve.
        // No aceptar una IP reenviada inventada por el cliente.
        onProxyReq(proxyReq, req) {
          proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress)
        },
      },
    },
  },
})

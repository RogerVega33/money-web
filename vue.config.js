const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,

  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Vue actúa como proxy al ejecutar npm run serve.
        // No aceptar una IP reenviada inventada por el cliente.
        onProxyReq(proxyReq, req) {
          proxyReq.setHeader('X-Forwarded-For', req.socket.remoteAddress)
        },
      },
    },
  },
})

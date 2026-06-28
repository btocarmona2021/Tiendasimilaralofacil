import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/shop/',
  server: {
    proxy: {
      '/shop/api': {
        target: 'http://localhost:3000',
        rewrite: path => path.replace(/^\/shop\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})

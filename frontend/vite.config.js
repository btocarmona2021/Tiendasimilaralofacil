import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/multitienda/',
  server: {
    proxy: {
      '/multitienda/api': {
        target: 'http://localhost:3000',
        rewrite: path => path.replace(/^\/multitienda\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})

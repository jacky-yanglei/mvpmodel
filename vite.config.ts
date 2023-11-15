import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    proxy: {
      '/opts': {
        target: "http://home.oceanforex.com:8001/", //跨域地址
        changeOrigin: true, //支持跨域
        rewrite: (path) => path.replace(/^\/opts/, "/opts")//重写路径,替换/api
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

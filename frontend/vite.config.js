import { defineConfig } from 'vite'

export default defineConfig({
  root: './src',
  publicDir: 'assets',
  build: {
    outDir: '../dist',
    assetsDir: '.',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './src/index.html'
      }
    },
    minify: 'terser',
    sourcemap: false
  },
  server: {
    port: 3000,
    open: true,
    cors: true
  }
})

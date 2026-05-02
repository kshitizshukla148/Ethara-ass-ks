import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    target: "es2018",
    minify: false,
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/main.jsx"),
      name: "EtharaClient",
      formats: ["iife"],
      fileName: () => "assets/app.js",
    },
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
})

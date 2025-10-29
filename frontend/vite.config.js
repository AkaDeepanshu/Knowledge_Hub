import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Development server config
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  
  // Production preview server config
  preview: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: [
      'knowledge-hub-v1zr.onrender.com',
      '.onrender.com',  // Allow all Render subdomains
      'localhost',
      '127.0.0.1',
    ],
  },
  
  // Build config
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production for security
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})

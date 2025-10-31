import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ['7daa4a9e330d.ngrok-free.app'],
  },
  build: {
    rollupOptions: {
      // ✅ Faz o Vite ignorar o "konva" durante o bundle (corrige o erro da Vercel)
      external: ['konva'],
    },
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
    // ⚙️ opcional mas ajuda a builds limpos em produção
    chunkSizeWarningLimit: 1000,
  },
})

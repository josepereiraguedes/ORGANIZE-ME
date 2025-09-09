import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração para servir arquivos estáticos da pasta public e fixar a porta
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  server: {
    host: true,
    port: 5210
  }
});
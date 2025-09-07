import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Sistema de Gestão - Estoque e Financeiro',
        short_name: 'Gestão Pro',
        description: 'Sistema completo de gestão de estoque e financeiro',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: './icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /\.(jpg|jpeg|svg|ico)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
              }
            }
          },
          {
            urlPattern: /\/icon-(192|512)\.png$/,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'manifest-icons',
              expiration: {
                maxEntries: 2,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ],
        navigateFallback: null,
        navigateFallbackAllowlist: [/^\/$/]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      external: ['stream', 'http', 'url', 'https', 'zlib'],
      output: {
        manualChunks: undefined,
        compact: false,
        minifyInternalExports: false
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        defaults: false,
        drop_console: false,
        keep_fnames: true,
        keep_classnames: true
      },
      mangle: false,
      format: {
        comments: true,
        beautify: true
      }
    }
  }
});
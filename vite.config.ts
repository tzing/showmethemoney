import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import Sitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://twqr.tzing.dev',
      generateRobotsTxt: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      minify: false,
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        minify: false,
      },
      devOptions: {
        enabled: true,
      },
      includeAssets: ['/icons/icon-64.png'],
      manifest: {
        name: '給我錢',
        short_name: '給我錢',
        description: 'TWQR 轉帳 QR code 產生器',
        lang: 'zh-TW',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        theme_color: '#f97316',
        background_color: '#feefc6',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})

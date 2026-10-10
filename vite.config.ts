import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // Service worker activates immediately on new deploy
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          // Cache app shell + assets
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        },
        // Tells the plugin the manifest lives in /public already
        // (manifest injection still handled, but we don't re-emit the file)
        manifest: {
          name: 'HomeFit 30',
          short_name: 'HomeFit',
          description: 'Mobile-first 30-day home workout program with personalized body metrics and training plans.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#0F172A',
          theme_color: '#0F172A',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

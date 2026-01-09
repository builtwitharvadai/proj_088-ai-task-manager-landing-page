import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      format: {
        comments: false,
      },
    },

    // CSS optimization
    cssMinify: true,
    cssCodeSplit: true,

    // Asset optimization
    assetsInlineLimit: 4096,

    // Rollup options for code splitting and optimization
    rollupOptions: {
      output: {
        // Manual chunks for vendor code splitting
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // Asset naming with content hash for caching
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];

          if (/png|jpe?g|svg|gif|webp|avif|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          if (/css/.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },

    // Report compressed size
    reportCompressedSize: true,

    // Chunk size warning limit
    chunkSizeWarningLimit: 500,

    // Source maps for production debugging
    sourcemap: true,
  },

  // Server configuration for development
  server: {
    port: 3000,
    open: true,
    cors: true,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    open: true,
  },
});
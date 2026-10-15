import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  cacheDir: '.vite-cache',
  build: {
    rollupOptions: {
      input: { main: resolve(import.meta.dirname, 'index.html'), playground: resolve(import.meta.dirname, 'playground.html') },
    },
  },
});

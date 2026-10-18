import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  cacheDir: '.vite-cache',
  build: {
    rollupOptions: {
      input: {
        scroll: resolve(import.meta.dirname, 'scroll/index.html'),
        main: resolve(import.meta.dirname, 'index.html'),
        playground: resolve(import.meta.dirname, 'playground.html'),
        cat: resolve(import.meta.dirname, 'cat/index.html'),
        catPlayground: resolve(import.meta.dirname, 'cat/playground.html'),
      },
    },
  },
});

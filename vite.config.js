import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  cacheDir: '.vite-cache',
  plugins: [{
    name: 'scrollo-route-alias',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const url = new URL(request.url, 'http://vite.local');
        if (/^\/scrollo\/?$/.test(url.pathname)) request.url = `/scroll/${url.search}`;
        next();
      });
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const page = bundle['scroll/index.html'];
        if (page?.type !== 'asset') this.error('Missing built Scrollo page');
        this.emitFile({ type: 'asset', fileName: 'scrollo/index.html', source: page.source });
      },
    },
  }],
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

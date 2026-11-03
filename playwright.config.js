// Browser checks run against the built site (dist/), served by `vite preview`. Run `npm run build` first.
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  testMatch: /.*\.spec\.js/,
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:4173', serviceWorkers: 'block' },
  // CI uses the browser Playwright downloads. Locally, PLAYWRIGHT_CHANNEL=chrome drives an installed Google Chrome instead.
  projects: [{ name: 'chromium', use: { browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL || undefined } }],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 60000,
  },
})

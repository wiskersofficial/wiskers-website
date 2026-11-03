// The built site may only load its own files plus the origins listed here. Ported from the Echoes "no external requests" check.
// The site sends no Content-Security-Policy today (there is no _headers file), so this test does not assert a CSP header.
// Adding one is a separate decision: it would need the font origins below and the Stripe/analytics origins, if any, added first.
import { test, expect } from '@playwright/test'

const ALLOWED_ORIGINS = new Set([
  'https://fonts.googleapis.com', // DM Sans, loaded by index.html
  'https://fonts.gstatic.com',    // font files for the same stylesheet
])
const PAGES = ['/', '/cat/']

for (const path of PAGES) {
  test(`no external requests on ${path}`, async ({ page, baseURL }) => {
    const own = new URL(baseURL).origin
    const external = []
    page.on('request', (req) => {
      const origin = new URL(req.url()).origin
      if (origin !== own && !ALLOWED_ORIGINS.has(origin)) external.push(req.url())
    })
    const response = await page.goto(path, { waitUntil: 'load' })
    expect(response.status()).toBe(200)
    await page.waitForTimeout(1500)
    expect(external).toEqual([])
  })
}

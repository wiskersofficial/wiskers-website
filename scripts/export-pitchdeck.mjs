#!/usr/bin/env node
// Export the pitch deck to public/pitchdeck.pdf, one 1600x900 page per slide.
// Run it against the built site: `npm run build && npm run preview`, then `npm run pitchdeck:pdf`.
// The page is laid out at the slide's own size (not a small headless window), and every
// scroll-driven effect is set to its finished state before printing.
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')));
const url = args.url || 'http://127.0.0.1:4173/pitchdeck/';
const output = path.resolve(args.output || 'public/pitchdeck.pdf');
// Uses the installed Chrome by default; pass --channel= (empty) to use Playwright's own Chromium.
const channel = args.channel ?? 'chrome';

const browser = await chromium.launch({channel: channel || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage({viewport: {width: 1600, height: 900}, deviceScaleFactor: 2});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url, {waitUntil: 'networkidle'}).catch(() => { throw new Error(`Could not open ${url}. Is the preview server running (npm run preview)?`); });
  await page.evaluate(() => document.fonts.ready);
  // Let the 3D scenes draw a frame, then take the print stills.
  await page.waitForTimeout(1500);
  await page.emulateMedia({media: 'print'});
  await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
  await page.evaluate(async () => {
    // The deck switches lazy images to eager for print; wait for them (each capped, so one bad image cannot hang the export).
    const settle = img => Promise.race([img.decode().catch(() => null), new Promise(r => setTimeout(r, 10000))]);
    await Promise.all([...document.images].filter(img => img.getAttribute('src')).map(img => img.complete ? null : settle(img)));
  });
  await page.waitForTimeout(300);
  if (errors.length) throw new Error(`Page errors:\n${errors.join('\n')}`);
  const data = await page.pdf({width: '1600px', height: '900px', preferCSSPageSize: true, printBackground: true});
  const tmp = `${output}.tmp`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, output);
  console.log(`Saved ${output} (${data.length.toLocaleString('en-GB')} bytes)`);
} finally {
  await browser.close();
}

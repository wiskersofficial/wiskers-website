#!/usr/bin/env node
// Submit the site's sitemap URLs to IndexNow (Bing, Yandex and others). Ported from the personal caffy-seo script.
// Dry run by default: it reads the live sitemap, checks the key file, and prints what it would send.
//   node scripts/indexnow.mjs            dry run, nothing sent
//   node scripts/indexnow.mjs --submit   sends the URLs (needs an owner's yes in chat first)
// The key is read from the environment variable INDEXNOW_KEY (its value lives in Vaultwarden, never in this repo).
// IndexNow only accepts a key whose file is served at https://<host>/<key>.txt, so that file must be in public/ first.
import process from "node:process";

const HOST = "wiskers.click";
const SITEMAP = `https://${HOST}/sitemap.xml`;
const submit = process.argv.includes("--submit");
const key = process.env.INDEXNOW_KEY;

if (!key || !/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
  console.error("indexnow: INDEXNOW_KEY is not set (or is not a valid key). Nothing sent.");
  process.exit(1);
}

const sitemap = await (await fetch(SITEMAP)).text();
const urls = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()))];
if (!urls.length) { console.log("indexnow: the sitemap lists no URLs; nothing to submit"); process.exit(0); }

const keyFile = await fetch(`https://${HOST}/${key}.txt`);
const keyText = keyFile.ok ? (await keyFile.text()).trim() : "";
if (keyText !== key) {
  console.error(`indexnow: https://${HOST}/<key>.txt does not return the key yet (HTTP ${keyFile.status}). Add the key file to public/ and deploy it first.`);
  process.exit(1);
}

console.log(`indexnow: ${urls.length} URL(s) from ${SITEMAP}`);
urls.forEach((u) => console.log(`  ${u}`));
if (!submit) { console.log("indexnow: dry run, nothing sent (add --submit to send)"); process.exit(0); }

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList: urls }),
});
console.log(`indexnow: submitted, HTTP ${res.status}`);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);

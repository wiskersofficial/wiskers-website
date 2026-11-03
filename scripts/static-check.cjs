#!/usr/bin/env node
/**
 * static-check.cjs <dir> — the "does it still hold together" check for the built site (dist/, from `npm run build`).
 * Exit 0 = nothing wrong, 1 = problems listed, 2 = bad usage.
 *
 *   1. every local reference in HTML and CSS (href, src, poster, srcset, url()) points at a file that exists, resolved the way a browser
 *      resolves it against the site root (so "../x.glb" on the home page is "/x.glb", and "/terms" may be terms/index.html or terms.html)
 *   2. no secret-shaped string is committed (live or test Stripe keys, webhook secrets, private keys, AWS and GitHub tokens)
 *   3. no file is over GitHub's 100 MB limit (warns above 25 MB), and CNAME, if present, is one hostname
 *
 * It cannot tell that a page looks right; it only catches the mechanical breakage an edit makes.
 */
"use strict"
const fs = require("node:fs")
const path = require("node:path")

const SKIP_DIRS = new Set([".git", "node_modules", ".wrangler", ".claude", ".vscode", "_site"])
const TEXT_EXT = /\.(html?|css|js|mjs|json|xml|txt|md|svg|yml|yaml|toml|webmanifest)$/i
const SECRETS = [[/\bsk_(live|test)_[0-9A-Za-z]{10,}/, "a Stripe secret key"], [/\brk_(live|test)_[0-9A-Za-z]{10,}/, "a Stripe restricted key"], [/\bwhsec_[0-9A-Za-z]{10,}/, "a Stripe webhook secret"], [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"], [/\bAKIA[0-9A-Z]{16}\b/, "an AWS access key id"], [/\bgh[pousr]_[A-Za-z0-9]{30,}/, "a GitHub token"]]
const SKIP_REF = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\{|<%|\$\{|\{\{)/i   // external schemes, protocol-relative, fragments, template markers

function walk(dir, root = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), root, out) } else if (e.isFile()) out.push(path.relative(root, path.join(dir, e.name)))
  }
  return out
}

function check(dir) {
  const files = walk(dir), have = new Set(files), problems = [], warnings = []
  const exists = (p) => have.has(p)
  const resolves = (sitePath) => {
    const p = decodeURIComponent(sitePath).replace(/^\/+/, "")
    if (p === "") return exists("index.html")
    if (exists(p)) return true
    const bare = p.replace(/\/$/, "")
    return exists(`${bare}/index.html`) || exists(`${bare}.html`)
  }
  let refs = 0, pages = 0
  for (const f of files.filter((x) => /\.(html?|css)$/i.test(x))) {
    pages++
    let text; try { text = fs.readFileSync(path.join(dir, f), "utf8") } catch { continue }
    const found = []
    if (/\.html?$/i.test(f)) {
      for (const m of text.matchAll(/\b(?:src|href|poster|data-src)\s*=\s*["']([^"']*)["']/gi)) found.push(m[1])
      for (const m of text.matchAll(/\bsrcset\s*=\s*["']([^"']*)["']/gi)) for (const part of m[1].split(",")) found.push(part.trim().split(/\s+/)[0])
    }
    // inline data: URIs (an SVG texture, say) are not fetched and may contain url(#id) text of their own: skip them
    const css = text.replace(/url\(\s*"data:[^"]*"\s*\)|url\(\s*'data:[^']*'\s*\)|url\(\s*data:[^)]*\)/gi, "")
    for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) found.push(m[1])
    const here = "/" + path.posix.dirname(f.split(path.sep).join("/")) + "/"
    for (const raw of found) {
      const ref = raw.trim(); if (!ref || SKIP_REF.test(ref)) continue
      refs++
      let sitePath; try { sitePath = new URL(ref, `https://site.invalid${here.replace(/^\/\.\//, "/")}`).pathname } catch { continue }
      if (!resolves(sitePath)) problems.push(`${f}: "${ref}" points at ${sitePath}, which does not exist`)
    }
  }
  let scanned = 0
  for (const f of files) {
    let st; try { st = fs.statSync(path.join(dir, f)) } catch { continue }
    if (st.size > 95 * 1024 * 1024) problems.push(`${f}: ${(st.size / 1048576).toFixed(0)} MB is over GitHub's 100 MB file limit`)
    else if (st.size > 25 * 1024 * 1024) warnings.push(`${f}: ${(st.size / 1048576).toFixed(0)} MB is large for a web page`)
    if (!TEXT_EXT.test(f) || st.size > 2 * 1024 * 1024) continue
    scanned++
    let text; try { text = fs.readFileSync(path.join(dir, f), "utf8") } catch { continue }
    for (const [re, what] of SECRETS) if (re.test(text)) problems.push(`${f}: looks like it contains ${what}`)
  }
  if (exists("CNAME")) { const c = fs.readFileSync(path.join(dir, "CNAME"), "utf8").trim(); if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(c)) problems.push(`CNAME: "${c.slice(0, 40)}" is not a single hostname`) }
  return { problems, warnings, summary: `${pages} html/css file(s), ${refs} local reference(s), ${scanned} file(s) scanned for secrets` }
}

if (require.main === module) {
  const dir = process.argv[2]
  if (!dir || !fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { console.error("usage: static-check.cjs <site directory>"); process.exit(2) }
  const r = check(path.resolve(dir))
  for (const w of r.warnings) console.log(`warning: ${w}`)
  if (r.problems.length) { console.log(`static-check: ${r.problems.length} problem(s) (${r.summary})`); for (const p of r.problems.slice(0, 12)) console.log(`  - ${p}`); if (r.problems.length > 12) console.log(`  ... and ${r.problems.length - 12} more`); process.exit(1) }
  console.log(`static-check: OK (${r.summary})`)
}
module.exports = { check }

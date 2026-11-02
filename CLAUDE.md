# wiskers-website

The public marketing site for Wiskers: an interactive cat that scrolls the visitor through the pitch. It is a Vite site (vanilla HTML and JavaScript, three.js), deployed as the `wiskers-website` Cloudflare Worker.

Read these before you change anything:

- `AGENTS.md`: the cat direction, the approved poses and motion, and the release authorization. It supersedes older notes in this repo.
- `DEPLOYMENT.txt`: the contribution and release steps. It is the release gate.
- `README.md`: the design notes and the preview steps.

## Commands

- Install: `npm ci`
- Dev server: `npm run dev`, then open the URL it prints (the README also gives a fixed-port form: `npm run dev -- --port 5178 --configLoader runner`)
- Build: `npm run build`. Run it before every commit to `dev`. It writes `dist/`, which is gitignored.
- Preview the build: `npm run preview`
- Pitch deck PDF: `npm run pitchdeck:pdf` (runs `scripts/export-pitchdeck.py`)

## Release

- Start from `dev`: `git switch dev`, then `git pull --ff-only origin dev`. Commit and push the change to `dev`.
- Open a PR from `dev` to `main`. GitHub Actions runs the audit, build and Wrangler dry-run checks, and Cloudflare Workers Builds makes a preview. Wait for both, then merge.
- Merging to `main` deploys production through Cloudflare Workers Builds. That publishes the public site, so ask an owner in one line and wait for a yes before you merge.
- Never run `wrangler deploy` or `npx wrangler deploy` by hand. Git is the release path.
- Do not push to `main` directly, force-push, or merge with a failed build.

## Rules for this repo

- It is public. Never commit secrets, `.env*` files, tokens or personal paths. `.env*` is gitignored; keep it that way.
- Cat art: follow the source list and style rules in `AGENTS.md`. Do not delete archived art, and do not use it as a style master.
- Keep reduced-motion behaviour working (see `README.md`).
- Team rules for the Wiskers workspace are in `~/Wiskers/CLAUDE.md`.

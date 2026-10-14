# wiskers website

The canonical website source lives in this folder. The rest of the Tabby vault is not part of the website and must not be uploaded.

## Local preview

Run `npm ci`, then `npm run dev`. Run `npm run build` to create the static publishing folder `dist/`.

## Contact

Website domain: https://wiskers.click. Customer contact: hello@wiskers.click. The similarly spelled whiskers.click is not our domain.

## Publishing

The site is built with `npm run build` into `dist/`. Cloudflare's connected repository currently runs `npx wrangler deploy` after the build. The Wrangler configuration must target the existing Worker and publish `dist/` as static assets. No runtime server or secret keys are required.

The source is mirrored to `wiskersofficial/wiskers-website` without uploading the vault. The existing Cloudflare project serves wiskers.click. Preserve the existing domain and email DNS records.

## Content basis

Copy is based on Archive/Navigation/TABBY.md, Areas/Clients.md, and the Data Room Company Overview and Offering notes. The business is at an early stage. No client logos, outcome statistics, pricing or established publisher network are claimed.

## Asset attribution

The website uses a custom-generated Wiskers cat animation library. Its normalized sprite strips are in `public/assets/wiskers-cat/`; no purchased sprite pack is loaded by the site. The older 3D cat and its license are archived in `legacy-3d/` and are no longer used by the site.

## Thesis visual

The From reading to doing section adapts the supplied flow diagram into a responsive comparison with three explorable steps. Quantified bounce and ROI statements from the reference are omitted pending evidence. The mechanism is presented as a working thesis.

## Color schemes

Day, Night and Twilight can be selected in the header. Selection persists locally; the initial default follows system light/dark preference. `src/palette-v1.json` holds the approved v1 palette.

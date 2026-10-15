# Wiskers layout redesign preview

Prepared 15 October 2026 from the existing Wiskers website checkout. This is a local review version; the production site has not been published or changed.

## Design

Preserves the Wiskers wordmark, palette, Day / Night / Twilight themes, business copy, openable problem statement, interactive question example, contact and legal pages. Staggered statement blocks, comparison tiles, answer card and approach cards provide varied surfaces. The opening cat scene begins seated on “content” with a short forward-looking idle, then looks up and reacts near the top edge before falling back-first, righting itself and landing inside the blue “Insight takes input” tile.

Three custom pixel-art yarn balls start on a small shelf beside Follow your curiosity. Each rolls a short distance left, tips forward over the front lip, then drops vertically and hangs at its option. Options remain staggered left to right. There are no lower landing platforms. Labels are Option 1, Option 2, and Option 3. There is no selection, analytics or backend behavior yet. The sprite atlas was generated with the built-in image generation tool; see public/art/yarn-art-notes.txt.

Scrolling is native. Artwork moves continuously with small scroll-linked offsets. Yarn motion combines a short horizontal roll, a forward tip, and a vertical drop, and rewinds with upward scrolling; there is no scroll interception, pinning or snap. Reduced-motion preference presents the completed yarn scene statically and disables offsets and smooth anchor scrolling.

## Preview

Run `npm run dev -- --port 5178 --configLoader runner` and open http://127.0.0.1:5178/.

Run `npm run build -- --configLoader runner` for production output in dist/. Both index.html and playground.html contain the redesign. The durable, byte-for-byte permanent C visual master is `public/art/cat-master-c/reference.png`; its original source and SHA-256 are recorded beside it in `public/art/cat-master-c/MASTER.txt`. Derive every future cat pose and animation from this reference, with new cat image generation limited to Luna agents. The permanent C master is `public/art/cat-master-c/reference.png`. The Luna-created grooming and falling atlases live in `public/art/cat-groom-c-v2/` and `public/art/cat-fall-c-v1/`; both use a 128 × 128 viewport, shared (64,113) foot anchor and per-frame cell clipping. Older `cat-content` atlases are archived reference material.

## Verification

Vite production build passed. Browser checked at desktop, 390px and 320px widths. Checked question answer changes, modal open/close, theme changes, no horizontal page overflow at tested widths, and console warnings/errors (none). Reduced-motion behavior is implemented in CSS and JS; OS-level reduced-motion emulation was not run.


## Hanging-yarn revision, 15 October 2026

Moved the starting positions left, reversed the option sequence to left-to-right, removed all starting/landing platform markup, and changed the motion to vertical drops ending in suspended balls. String endpoints and sprite centres share the same coordinates on every animation update.

Two Luna checking agents requested by the user reviewed attachment and movement. The simulation checker passed 2,496 assertions across four viewport sizes, both scroll directions, resizing and reduced motion. Browser endpoint measurements at desktop and 390px width were within 0.01 CSS pixels of sprite centres. The production site is unchanged.


## Roll-before-drop revision, 15 October 2026

Restored one small starting shelf at the marked heading position. Motion now rolls left at constant height for its first 32%, tips forward over the front lip for the next 12%, and then drops to hang. Perspective tilt and a small centred scale change suggest falling towards the viewer. A shared endpoint drives both each sprite and its horizontal-then-vertical strand.

Luna motion simulation passed 14,961 assertions across four viewport sizes, forward/reverse scrolling, phase boundaries, resize and reduced motion. Browser checks show the starting shelf at desktop/mobile, a visible horizontal roll before descent, and string endpoint error below 0.01 CSS pixels. Production is unchanged.


## Subtle shelf and static-text revision, 15 October 2026

Reduced the shelf to a muted 2px line and extended it left. Starting ball coordinates are unchanged; final blue/red coordinates are farther left, with green unchanged. Replaced the PDF illustration with the exact user-provided wall-of-text paragraph in small, muted, unadorned type. Latest Luna motion simulation passed 15,753 assertions covering the wider rolls, attachment, phase continuity, resize, and reduced motion. Production build passed.


## Earlier perched-cat beat, 15 October 2026

Framed the static text as a subdued document. Added a ginger cat with blue eyes when open, sitting directly on the word content. The user later expanded this beat with a fall into the blue statement tile; the current scene is described below. The durable C master is `public/art/cat-master-c/reference.png`; future poses and atlases derive from it, and only Luna agents may generate new cat images. The current atlas is in `public/art/cat-content-c-v1/`; the earlier `cat-content-v1` atlas remains archived and must not become the identity master. The display frame remains 96 × 104 CSS pixels. Each frame clips to its source cell independently of the normalized viewBox. This is required because the grooming crops extend up into the preceding row; the cell clip removes those previous-row pixels without cutting the grooming pose. Image loading completes before the cat is revealed, and reduced motion uses the seated frame.

The prior atlas was browser-checked for sitting/grooming at desktop and 320px, plus the word-anchor layout at 746px; at 320px the headline was adjusted to keep Generic content on one line. For the C atlas, static alpha inspection confirmed that cell clipping removes the overlapping previous-row feet while retaining every opaque pixel of each intended sprite. Production build passed. Faint fringe pixels remain in the large source atlas; they are subtle at the fixed display size. The user's scene ownership, permanent C master, and Luna-only new cat artwork instruction are recorded in AGENTS.md.


## Scroll-driven cat landing scene

The approved sequence is: perch on “content”; groom a raised paw during a short scroll; react as the cat approaches the viewport top; fall back-first; right itself in midair; and land in the reserved lower area of the blue insight tile. The tile rocks slightly counterclockwise at contact, then settles. The cat remains attached to the tile afterward.

During the fall, the tile and everything below it move upward at 0.36× normal scroll speed. The remaining offset is held after landing, while native page scrolling returns to its normal rate. A matching trailing spacer keeps the footer reachable without snapping or pausing. The cat uses fixed positioning only while falling and becomes an absolutely positioned child of the tile at contact. Scrolling back reverses the sequence.

The scene uses the C-derived `cat-groom-c-v2` and `cat-fall-c-v1` atlases, each normalized to a 128 × 128 CSS-pixel viewport, a (64,113) foot anchor, and an approximately 78 × 85.5 visible sprite. Reduced motion leaves the seated cat on “content” and disables the fall, lower-page parallax and impact. Production remains unchanged.


## Current revision: compact tile, frame counter and release workflow

The insight tile retains its original content-driven dimensions and normal responsive padding. Falling room comes from adaptive lower-page movement beginning with the first scroll: `src/cat-scene-math.js` measures the compact tile and aims for the cat's landing near 52% of the viewport height. Content always moves upward, at 0.12–0.65 of native speed, and resumes normal speed after contact with its accumulated offset preserved. This supersedes the fixed 0.36 rate and reserved card space described in the initial scene above. The landing point is 48px from the tile's left edge and 8px below its front edge, keeping the cat clear of the copy while the tile stays compact.

A temporary fixed counter shows unique frame IDs 01–08 for Groom and 09–20 for Fall. It appears automatically in the local dev server; on deployed/built pages use `?cat-debug=1`. Ordinary deployed visits do not show this development overlay. Remove the review aid when cat development is finished.

The preview is now a checkout of `wiskersofficial/wiskers-website`, with existing history preserved. The user authorized pushing each completed change to `dev`, then merging validated changes into `main`. Main is connected to Cloudflare publication; do not force-push or overwrite remote changes. The redesign baseline is commit `77de2e2` on dev. Earlier notes that this folder was unversioned describe the period before this revision.

Run `node --test scripts/cat-scene-math.test.mjs` for compact-layout, continuous-scroll, contact, reverse and offset checks. Check the actual browser for pose alignment, text clearance, resize and counter accuracy; passing math tests alone does not prove visual quality.


## Atlas-safe fall and landing revision

Replaced runtime grooming with three quiet forward-gaze idle frames, cycling in order every 96 scroll pixels (32 pixels per pose). The idle atlas `cat-idle-c-v4` was drawn by Luna from the canonical Style C master and the approved settled pose `fall-12` (frame 27) as the seated action reference. The scene loads and decodes all three active atlases before revealing the cat: `cat-idle-c-v4`, `cat-fall-c-v1`, and `cat-transition-c-v2`. Each atlas has a persistent SVG image layer with its own source URL, cell clip and view box. The target layer receives its complete geometry before the active layer changes, so reverse scrolling and deep-link loads cannot momentarily combine a new crop with the previous sheet. If any sheet is unavailable, the cat stays hidden and the rest of the page remains usable.

The 24 fall/landing poses use short frame labels. Frames 01–03 are `idle-1`–`idle-3`; 04–27 map in order to: `fall-1`, `fall-2`, `fall-3`, `fall-4`, `twist-1`, `fall-5`, `twist-2`, `twist-3`, `fall-6`, `twist-4`, `twist-5`, `fall-7`, `twist-6`, `fall-8`, `fall-9`, `fall-10`, `land-1`, `land-2`, `fall-11`, `land-3`, `land-4`, `land-5`, `land-6`, and `fall-12`. Use these labels in feedback (for example, “frame 6, fall-3”); frame numbers still give the exact position in the full sequence. The previous Fall-only crosswalk remains: old frames 09–20 now appear at current frames 04, 05, 06, 07, 09, 12, 15, 17, 18, 19, 22 and 27 respectively.

The scare begins when the head reaches the viewport top edge, and the scare window lasts 30 scroll pixels. The lower world still moves continuously, with native scrolling and no page pinning. Flight ends at the registered contact pose; the cat then recovers through the interleaved landing poses over 190 scroll pixels. The tile and attached cat move together: the tile rocks counterclockwise and sinks about 10px, rebounds about 2px, then returns to its original position as the rotation settles across 240 pixels. Reduced motion leaves the cat on forward-looking idle frame 01 with no fall, parallax or impact. The new seated idle atlas renders approximately 78 × 85.5px while keeping the 128px viewport and (64,113) anchor. Its three source-cell clips share one scale and paw baseline.

Math checks cover the stable pose map and ordering, flight-to-contact handoff, idle progression, impact endpoints, continuous page motion and landing geometry. Browser checks on the local desktop preview confirmed the loaded idle, interleaved contact/landing, settled pose and reverse return to idle. Further narrow-mobile and OS reduced-motion inspection remains part of final release validation.


## Model-guided cat redraw, 16 October 2026

The website now uses versioned action atlases `cat-fall-c-v2` and `cat-transition-c-v3`; the approved forward-looking idle atlas and the existing 27-frame scroll path are unchanged. The five-view `base-model` sheet is the primary drawing shape guide, the canonical Style C master remains the pixel identity reference, and the 3D proxy is used only for pose and motion direction. Sequence guidance uses believable cat mechanics with cartoon readability: head and shoulders lead, hips follow, paws tuck or reach, the tail trails, and landing compresses then recovers.

The revised upward-facing `fall-4` and `twist-2` cells show four paws/legs and one tail. `fall-12` is restored pixel-for-pixel from the approved original atlas. Both new atlases use 1448 × 1086 RGBA sheets, 4 × 3 cells, a 128 × 128 viewport and the shared (64,113) foot anchor. Exact prompts, frame order and anatomy review are recorded in `artifacts/cat-motion-proxy-v2/`.

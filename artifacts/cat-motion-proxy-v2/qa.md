# Atlas and sequence QA

## Soft cartoon replacement — 16 October 2026

- The soft cartoon atlases supersede the previous C pixel-art atlases for the live scene. The old atlases remain available for rollback.
- The user approved the detailed ginger cat style and roughly the existing on-page footprint. The existing scroll route, timing, tile movement, tile impact, and reverse-on-scroll behavior are preserved.
- `scripts/build-soft-cat-atlases.py` maps the approved transparent drawings into three 1448 × 1086 RGBA atlases. Each atlas uses a 128 × 128 viewport, anchor (64,113), and 362 × 362 source cells. The script records the pose-to-cell mappings; repeated images are intentional holds across existing stable IDs.
- The fall arc reuses the approved seated startle, lift-off, back-first fall, recreated supine and righting poses, then keeps a right-facing orientation through approach, first paw contact, crouch, and seated hold. The final usable crouch is held through recovery because generated intermediate landing candidates baked a checkerboard into their backgrounds or jumped directly to sitting.
- Browser review at the site’s rendered size covered idle, early fall, twist, approach, landed, and scroll-up reversal. Desktop checks included frame 11 at scroll 400, frame 16 at scroll 622, and landing recovery at scroll 800. The landed cat remains at the blue tile’s lower-left; reverse scroll returned to an airborne pose without a snap.
- A 390 × 844 viewport check confirmed the mobile route uses its existing 650px fall distance and the cat lands at the lower-left of the blue tile. The art remains legible at its prior approximate display size.
- Day/night theme controls load and retain the cat correctly; visual contrast was checked on the night background. No browser errors were observed.
- The production Vite build succeeded using Vite’s runner config loader after the normal build encountered a temporary config-file permission error in `node_modules/.vite-temp`.
- The opt-in frame overlay now shows the live page scroll offset in CSS pixels alongside the stable pose ID. Browser verification at `scrollY = 400` showed `scroll 400px` while the matching pose label remained visible.

## Earlier pixel-atlas review history

- Independent Luna review confirmed the corrected `fall-4` and `twist-2` cells each show four paws/legs and one tail, with no obvious clipping or extra limb.
- The reviewer confirmed `fall-4` follows `fall-3` and precedes the righting sequence without an orientation reversal; `twist-2` fits between `twist-1` and `twist-3`.
- The final fall atlas restores the accepted original `fall-12` cell from `cat-fall-c-v1`.
- Atlas dimensions are 1448 × 1086 RGBA. Metadata retains the shared 128 × 128 viewport, anchor (64,113), and versioned frame order.
- The user accepted the visible edge fringe in the generated sheets. It is unchanged in the corrected cells.
- The Vite production build passed with the new atlas paths and assets.
- The local browser loaded all three atlas layers with no console warnings or errors. At the site display size, the review checked frames 06 `fall-3`, 07 `fall-4`, 10 `twist-2`, 11 `twist-3`, 17 `fall-8`, 19 `fall-10`, and 27 `fall-12`.
- The corrected poses remained legible at the default 660px browser width and a 390px mobile viewport. The landed cat sits at the lower-left of the tile; reversing the scroll returned to `idle-1` without a snap.
- Atlas metadata dimensions, viewport, anchor and 12-cell counts were checked. Decoded RGBA pixels for the new `fall-12` cell match the accepted original cell exactly.

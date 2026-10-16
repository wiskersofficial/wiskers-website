# Atlas and sequence QA

## Soft cartoon replacement — 16 October 2026

- The soft cartoon atlases supersede the previous C pixel-art atlases for the live scene. The old atlases remain available for rollback.
- The user approved the detailed ginger cat style and roughly the existing on-page footprint. The existing scroll route, timing, tile movement, tile impact, and reverse-on-scroll behavior are preserved.
- The user confirmed fall-1 is in the right position. Fall-2's position is also confirmed, but its image must be redrawn larger with a shocked expression; the current happy face and reduced scale break continuity. These are placement confirmations only, so neither frame receives a green approval corner yet.
- The user cut idle-3; idle-2 now leads directly into fall-1. For any requested redo, assess its actual previous and next sequence frames and create a fresh bridge pose. Expression continuity joins pose order, consistent scale/facing, ears, four limbs and tail in the acceptance check.
- Fresh `fall-2`, `fall-5`, `fall-6`, and `land-2` drawings were reviewed alongside their sequence neighbors at the website's 78px display scale. All have two ears, four limbs and a transparent background. Fall-2 keeps its tail trailing down and is enlarged through a source-specific art-size setting while retaining the shared viewport, foot anchor, and placement. Fall-1 is approved for both image and placement (green corner); fall-2's placement is approved and its current redraw is integrated, but the user has not yet approved the image.
- The full review sheet confirms the idle atlas contains only idle-1 and idle-2. The old terminal fall-12 pose remains in the source atlas for reference but is no longer part of the runtime sequence; land-6 now holds the first tile landing while the new continuation uses the freed frame slot.
- `scripts/build-soft-cat-atlases.py` maps the approved transparent drawings into three 1448 × 1086 RGBA atlases. Each atlas uses a 128 × 128 viewport, anchor (64,113), and 362 × 362 source cells. The script records the pose-to-cell mappings; repeated images are intentional holds across existing stable IDs.
- The fall arc reuses the approved seated startle, lift-off, back-first fall, recreated supine and righting poses, then keeps a right-facing orientation through approach, first paw contact, crouch, and seated hold. The final usable crouch is held through recovery because generated intermediate landing candidates baked a checkerboard into their backgrounds or jumped directly to sitting.
- Browser review at the site’s rendered size covered idle, early fall, twist, approach, landed, and scroll-up reversal. Desktop checks included frame 11 at scroll 400, frame 16 at scroll 622, and landing recovery at scroll 800. The landed cat remains at the blue tile’s lower-left; reverse scroll returned to an airborne pose without a snap.
- A 390 × 844 viewport check confirmed the mobile route uses its existing 650px fall distance and the cat lands at the lower-left of the blue tile. The art remains legible at its prior approximate display size.
- Day/night theme controls load and retain the cat correctly; visual contrast was checked on the night background. No browser errors were observed.
- The production Vite build succeeded using Vite’s runner config loader after the normal build encountered a temporary config-file permission error in `node_modules/.vite-temp`.
- The opt-in frame overlay now shows the live page scroll offset in CSS pixels alongside the stable pose ID. Browser verification at `scrollY = 400` showed `scroll 400px` while the matching pose label remained visible.

## Sequence update and ComfyUI pilot — 16 October 2026

- The user cut runtime `twist-1`; no replacement frame was inserted. The user then identified terminal `fall-12` as a placeholder for the continuation. It is no longer in the runtime sequence; land-6 holds the tile landing, the grooming pose uses counter 25, and the toggle press uses counter 26. The 560px/650px flight span is unchanged; `FLIGHT_FRAME_COUNT` remains 14 so recovery still starts at `fall-10`.
- A Comfy Cloud pilot used the Qwen Image 2.1 edit workflow with `fall-6-bridge-v2.png` as the previous-pose target and `reference-R7-pose.png` as the next-pose reference. Five free runs were used; no paid run was started. The first candidate jumped ahead and smiled; later results included tilted, startled poses and several overly upright/smiling variants. Comfy's preview was useful for pose direction, but its outputs stayed in the Cloud gallery and could not be downloaded into the repo through the browser.
- The first local redraw still read too much like `fall-6`, so it was rejected. A second fresh bridge, `twist-4-bridge-v3.png`, advances the shoulders and one foreleg toward R7 while the hips remain partly supine. It has two ears, four distinct paws, one tail, the wide-eyed open-mouth expression, and transparent pixels. It is wired into the review atlas for client review only; the user has not approved its image or placement, so it has no green corner.
- For future bridge checks, compare the candidate directly against both immediate neighbors at the website's actual display size. Reject any candidate that jumps to the next pose, changes the shocked expression into a smile, hides a limb/ear/tail, changes the cat's scale, or has a non-transparent background. Keep the runtime frame out until a full-resolution local asset passes those checks and the user approves its image and placement.

## Annotated page continuation — 16 October 2026

- The cat first lands and settles on the blue **Insight takes input** tile. Only after the 240px tile impact beat does it jump to the text wall, the colour-toggle preview, the buyer-question selector, and the yarn scene.
- On phones, the buyer-question section reserves a clear grooming lane between the helper note and answer card. The cat scales to that lane and does not cover the selector.
- The preview has an accessible button that works by click or keyboard. The cat activates it from the scroll-derived card stop; reverse scrolling restores the initial colour state unless the user manually toggles it while at that stop.
- The buyer-question stop uses a dedicated paw-lick pose positioned beside the selector so the control remains usable. Yarn contact scroll values are measured from the actual scene and each ball's travel phases, rather than copied from screenshots.
- Browser review checked the tile landing, tile-to-text-wall travel, the toggle reaction, selector placement and the final hanging-ball positions. Further visual approval of the new continuation remains with the user.

## Route and pose revision — 16 October 2026

- The yarn start positions now form a compact blue/coral/green cluster (desktop x coordinates 520/620/720; narrow x coordinates 250/400/550). The cat lands once on the top of that pile and stays there while the balls roll to their existing edge/drop positions. The cat then visits the three hanging balls in order. Ball motion and landing positions remain unchanged.
- `FULL_Cat 2D Pixel Art.zip` was inspected for movement only. Its LICK strip informed the paw raise, tongue contact, cheek wipe and paw-lower beats; its JUMP strip informed anticipation, launch, airborne travel and paws-down recovery. The production art remains in the approved soft cartoon style.
- `groom-paw-lick-sequence-v2.png` provides seven runtime poses. The generated cell that changed which forepaw was raised is intentionally omitted. The prior whole-sprite rocking animation has been removed; grooming is driven by the 120px selector hold and reverses with scroll.
- `route-jump-left-sequence-v1.png` provides six left-facing poses for the tile-to-text-wall hop only: crouch, launch, airborne, descent, contact and settle. Contact and settle play after the cat reaches the wall. This replaces the old two-frame right-facing hop without changing its scroll span.
- Visual browser review at the narrow viewport confirmed the left-facing wall landing, selector clearance, paw/tongue frames, the compact yarn cluster, blue-first movement and reverse return to the start cluster. Production build and syntax checks passed. Desktop-size review remains pending because no desktop browser surface was available in this task; user approval of the new art and placement is still pending.

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

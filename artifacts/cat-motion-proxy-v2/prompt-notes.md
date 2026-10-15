# Style C action atlas v2/v3 notes

## Drawing hierarchy

- `public/art/cat-master-c/reference.png` is the sole identity and pixel-style master.
- `public/art/cat-motion-proxy-v1/base-model.png` is the main guide for anatomy, proportions, markings, and orientation.
- `public/art/cat-motion-proxy-v1/cat-proxy-transition-guide.png` is only a pose and movement reference. Do not copy its smooth 3D rendering.
- Use plausible cat mechanics with readable cartoon timing: shoulders/head lead, hips lag, paws tuck or reach, tail trails, and landing compresses then rebounds.

## Atlas order

- `cat-fall-c-v2/fall-atlas.png`: `fall-1` through `fall-11` in cells 1–11, with the original `fall-12` restored pixel-for-pixel in cell 12.
- `cat-transition-c-v3/transition-atlas.png`: `twist-1` through `twist-6`, then `land-1` through `land-6`, row-major.
- The 24 action poses interleave in the existing stable order in `src/cat-scene-math.js`. The three forward-looking idle frames remain unchanged.
- Both atlases use a 4 × 3 grid of 362 × 362 px cells (1448 × 1086 px total). The display viewport remains 128 × 128 with foot anchor (64,113).

## Targeted anatomy corrections

The creator's upward-facing `fall-4` and `twist-2` drafts initially showed only three clear paws. Replaced only those two cells with corrected Luna-generated poses. Each replacement shows four paws/legs and one tail while preserving the direction and general pose. The generated sheets retain some edge fringe; the user reviewed the latest sheets and said this was acceptable.

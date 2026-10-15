# C transition atlas generation notes

Generated once with the built-in image generation tool. Image 1 was the canonical Style C identity master at `public/art/cat-master-c/reference.png`; Image 2 was `public/art/cat-fall-c-v1/fall-atlas.png`, used only for action boundaries. The new atlas is supplemental and does not replace either reference.

Exact prompt used:

```text
Use case: stylized-concept. Asset type: production pixel-art sprite atlas for a website animation.

Input images: Image 1 is the sole character identity and pixel-style master (canonical Style C cat). Image 2 is an existing fall sheet used only to understand pose boundaries and action direction; do not copy its errors or change the identity.

Primary request: Create ONE transparent atlas with exactly 12 new full-cat in-between frames, 4 columns × 3 rows, read left to right then top to bottom, generous transparent gutters, no visible grid. These frames will be interleaved with the existing fall sequence.

Style and identity: Preserve the master cat's orange ginger fur, dark russet tabby stripes and forehead marks, very large bright blue eyes when open, white muzzle/chest bib/paws, pink inner ears, brown nose, whiskers, round playful proportions, dark pixel outline, warm blocky pixel shading, one curled striped tail with white tip. Keep the same source-to-display scale: upright silhouette about 78 × 85.5 px in a conceptual 128 × 128 frame. Natural pose changes alter silhouette; never independently resize or stretch each pose. All 12 poses are one continuous cat with exactly four connected legs and one tail. No extra cats, props, clothing, collar, ground, shadow, labels, motion streaks, checkerboard, background or color wash.

Ordered pose list:
1. Twist A, immediately after old frame 3: cat still supine belly-up; head just starts turning to its right, front paws remain raised, hips unchanged.
2. Twist B, between old 4 and old 5: head and shoulders turn further right; forepaws begin to tuck; pelvis and hind paws still mostly belly-up.
3. Twist C, before old 5: shoulders rotate to a three-quarter side angle, head leads toward the floor, front paws tuck close; hips lag clearly behind.
4. Twist D, after old 5: shoulders nearly belly-down, head aligned with shoulders, hips have begun following, hindquarters still partly on side.
5. Twist E, before old 6: pelvis catches up, belly rotates toward floor, hind legs follow naturally; no backward rotation or detached paws.
6. Twist F, between old 6 and old 7: mostly belly-down, shoulders settled, hips complete turn, forepaws start reaching down.
7. Landing G, just after old 9: both forepaws have contacted the floor, hind paws still descending, body begins to compress.
8. Landing H, halfway toward old 10: forelegs flex and shoulders lower; hind paws contact and begin flexing.
9. Landing I, deepest stable four-paw crouch: weight visibly absorbed through all four connected legs; tail follows the body.
10. Recovery J: begins to rise from crouch, shoulders lift slightly while paws remain grounded.
11. Recovery K: forelegs extend and torso rises to a low sit, hindquarters grounded, one continuous body.
12. Recovery L, just before old 11: nearly upright recovered sit, same facing direction and footprint as the canonical seated cat, ready to match old frame 11.

Keep rotation physically continuous: head and shoulders lead the hips in the twist; hips follow smoothly. At all landing frames distribute weight through attached legs and paws. Keep the face, markings, pixel cluster scale, eye color and cat identity stable. Transparent pixels outside the 12 cats.
```

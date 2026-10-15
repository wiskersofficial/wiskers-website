# Style C cat sequence: proxy and frame brief

This working brief separates the cat's **pose** from its **screen path**. The pose atlases describe body shape, gaze, limb positions and expression in a shared 128 × 128 viewport. Website scroll math moves that registered sprite from the word to the tile. Avoid encoding the whole-screen journey as changing offsets inside the sprite cells.

## Drawing hierarchy and locked anchors

- The approved five-view `base-model` sheet at `public/art/cat-motion-proxy-v1/base-model.png` is the main guide for the cat's drawn shape, proportions, face, markings, paws, ears and tail. Keep its five approved views intact. A straight back view shows the back, rump and tail; no paws.
- The canonical Style C pixel-art master at `public/art/cat-master-c/reference.png` remains the style and pixel-density reference. Draw the cat shown by `base-model` in that established pixel style.
- The 3D motion model and `cat-proxy-sequence-guide.png` are pose, orientation and movement references only. Do not copy the smooth 3D rendering or its simplified features into final art. When the 3D shape conflicts with `base-model`, follow `base-model`.
- Keep current forward-looking idle atlas unchanged.
- Treat full-sequence frame 06 (`fall-3`, original `fall-v1-03`) as the expression and back-first body anchor. The targeted change is to place both front paws higher, closer to the head, while preserving its approved face and other pose features as closely as possible.
- Keep full-sequence frame 27 (`fall-12`, original `fall-v1-12`) pixel-for-pixel unchanged. It is the approved forward-facing settled pose and seated-action reference.
- Preserve a common 128 × 128 display viewport, foot anchor (64,113), upright visible scale about 78 × 85.5 CSS px, ginger tabby markings, large blue eyes when open, white muzzle/chest/paws, pink ears, one curled white-tipped tail, and exactly four legs.

## Screen path, separate from pose drawings

1. The cat sits on `content`, facing forward; the three approved idle frames cycle at 32 scroll px per pose.
2. When the top of the head reaches the viewport edge, show `fall-1` with the upward glance. Hold the cat in place for 30 scroll px while the page continues moving.
3. Across 560 desktop / 650 narrow-screen scroll px, move the cat from the word toward the landing point. Horizontal travel eases smoothly; vertical travel follows the existing quadratic flight curve. The lower page continues moving at its adaptive reduced speed throughout.
4. Contact is at the tile's left + 48 px, bottom + 8 px. Attach the cat to the tile so the tile's small rock, sink, rebound and settle carry the cat together.
5. Play the landing/recovery sequence over 190 scroll px; impact easing lasts 240 px. Reverse scrolling reverses the same path without snapping.

## Pose and expression progression

| Counter / ID | Gaze and expression | Body, paws and tail |
|---|---|---|
| 04 `fall-1` | Eyes glance up; ears tip back; small open mouth | Seated startle begins; support paws remain planted |
| 05 `fall-2` | Wider eyes; mouth opens slightly more | Shoulders recoil first; forepaws lift; hindquarters still anchored |
| 06 `fall-3` | Preserve exact approved expression | Preserve exact approved back-first drawing |
| 07 `fall-4` | Alert gaze tracks the motion | Keep falling back-first; shoulders open; hips lag |
| 08 `twist-1` | Eyes track the landing direction | Continue into supine; forepaws gather; tail trails |
| 09 `fall-5` | Focused, still startled | Belly turns toward viewer; natural airborne silhouette |
| 10 `twist-2` | Keep gaze connected to the path | Head/shoulders start turning; pelvis lags |
| 11 `twist-3` | Same focused look | Continue the roll; forepaws begin reaching |
| 12 `fall-6` | Alert, tracking | Clear supine midpoint; paws lift naturally; tail follows |
| 13 `twist-4` | Eyes orient toward the ground | Head/chest lead the turn; hips still behind |
| 14 `twist-5` | Expression eases from shock to focus | Pelvis follows; hind legs rotate after the shoulders |
| 15 `fall-7` | Focused | Mostly belly-down; paws prepare to brace |
| 16 `twist-6` | Eyes stay on the landing | Complete righting smoothly; feet orient toward support |
| 17 `fall-8` | Alert but composed | Righted approach; forepaws down, hind legs follow |
| 18 `fall-9` | Bracing | Descend with a compact, balanced shape |
| 19 `fall-10` | Briefly tightens for impact | First contact; shoulders compress without flattening |
| 20 `land-1` | Small impact blink/squint | Four-paw compression; feet remain grounded |
| 21 `land-2` | Alert again | Small rebound, still attached to the tile |
| 22 `fall-11` | Softening | Compact four-paw crouch |
| 23 `land-3` | Calm gaze starts to return forward | Chest lifts; shoulders recover |
| 24 `land-4` | Forwarding | Hindquarters settle; paws align under body |
| 25 `land-5` | Forward | Relaxed seated transition; tail curls into its usual shape |
| 26 `land-6` | Forward, calm | Final settling beat |
| 27 `fall-12` | Preserve exact approved expression | Preserve exact approved seated drawing |

## Movement reference

- Use believable cat biomechanics with readable cartoon exaggeration. Movement should feel soft, springy and weight-aware, never like a rigid toy rotating around one hinge.
- In a startle and fall, the head and shoulders react first, hips lag, paws tuck toward the chest/head, and the tail trails. During righting, the head/shoulders turn toward the landing first, then pelvis and hind legs follow. At contact, paws reach for support, legs compress, and the body settles with a small rebound.
- Use the 3D board to understand broad pose and turn direction, then draw the final silhouette from the 2D `base-model` sheet. The model does not overrule the approved character drawing.

## Smoothness rules for drawing and timing

- Treat each frame as a measured step from its immediate neighbors. No pose should jump to the opposite side of a turn; shoulder/head rotation leads, hips lag, paws follow, and the tail trails.
- Keep expression changes sparse and continuous: upward startle, focused fall, bracing contact, then forward calm. Do not reinvent the face on every frame.
- Maintain a fixed camera and common apparent scale. Let reclining, twisting and crouching change the silhouette naturally; do not height-normalize poses.
- Keep the art free of background, tile, text, motion streaks and floor shadows. The website supplies the path and impact.
- Keep the approved master and idle files. Preserve `fall-12` pixel-for-pixel after any generated atlas pass; make only the specifically requested higher-front-paw adjustment to `fall-3`.

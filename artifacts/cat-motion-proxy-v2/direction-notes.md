# Cat style and animation direction

Updated 16 October 2026.

## Approved style and route

The user chose the detailed, softly shaded cartoon close to `public/art/cat-motion-proxy-v2/base-model-2.png`. Preserve the ginger tabby, blue eyes when open, white muzzle/chest/paws/tail tip, pink ears, rounded proportions, and roughly the previous visible footprint. The simplified option in `style-proof-flat-v2.png` is retained as a fallback; use it only if the user asks to switch.

Keep the existing scroll-driven perch → reaction → back-first fall → righting → lower-left landing in the blue “Insight takes input” tile. The page continues scrolling normally and the scene reverses on scroll-up. Preserve the existing timing, responsive distances, tile impact, and reduced-motion behavior.

## How the animation advice applies

Treat the pasted ControlNet/IP-Adapter/EbSynth workflow as guidance, not as a literal tool requirement. Pose structure and character reference are considered separately: use a consistent approved cat reference, generate meaningful key poses, and manually compare adjacent transitions at the actual website display size. Standard OpenPose is human-oriented, IP-Adapter guides resemblance rather than guaranteeing identity, and EbSynth needs a prepared motion guide; none is currently used by this site. Regenerate a pose if anatomy or continuity is wrong instead of trying to patch a bad drawing.

## Production sequence

- `scripts/build-soft-cat-atlases.py` maps the reviewed transparent poses into the live idle, fall, and transition atlases. It records pose-to-cell mappings and builds the three atlases reproducibly.
- The approved nine-pose sheet had pose 5's missing ear and pose 6's extra limb recreated. The user approved those corrections and the remaining poses.
- The approach stays right-facing through near-contact, first paw contact, crouch, and recovery. The usable chest-lift crouch is held for a beat before the approved seated pose because attempted in-between generations baked checkerboards into their backgrounds or skipped too far into sitting.
- `full-sequence-review.html` previews the live atlas crops and viewBoxes on light, dark, plum, and blue-tile backgrounds. `qa.md` records route, anatomy, desktop, mobile, and build review.

Keep the original reference and all approved source poses unchanged. Preserve rejected generations as process history only; do not include checkerboard-baked art in the live atlas.

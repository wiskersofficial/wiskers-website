# C master grooming atlas v2

Generated with the built-in image-generation tool from the canonical `../cat-master-c/reference.png`. The supplied website screenshot was used only as a scale/action reference and explicitly treated as containing an anatomy error. The earlier C atlas was inspected but not used as the character master. The master image and previous atlases are unchanged.

## Metadata and scale

The transparent RGBA sprite atlas is 1774 × 887 with four columns and two rows. `atlas.json` includes per-frame `cellRects` for clipping, per-frame source-image `viewBoxes`, and the shared output viewport `{width:128,height:128,anchorX:64,anchorY:113}`. The final repaired atlas uses equal 550 × 554.5 view boxes. Based on final alpha bounds above 230, the visible cat averages about 334.9 px wide and 370.4 px high in source, mapping to about 77.9 × 85.5 px in the common viewport. Crop origins center each cat at x=64 and place every visible foot baseline at y=113.

Frames 0–7: neutral sit; forepaw starts lifting; elbow bends and paw reaches chest; paw nears muzzle; brief tongue contact with raised paw; raised paw wipes muzzle; paw lowers; return to neutral sit. Frames 1–6 have one lifted foreleg connected to the viewer-left shoulder and exactly three grounded paws. Frames 0 and 7 have four grounded paws.

## Prompt used

Use the canonical C master as the absolute source of character identity, proportions, face and pixel style. Use the supplied website image only as scale/action reference; it contains an anatomy error and must not be copied. Create an exactly 4-column × 2-row transparent sprite atlas of the same front-facing ginger cat. Preserve the oversized round face, big bright blue eyes with black pupils when open, upright pink-interior ears, forehead and cheek stripes, white muzzle, small brown nose and smile, white chest bib, white paws, curled striped viewer-right tail, warm orange/cream palette, dark outline, playful rounded proportions and crisp pixel clusters.

The cat has exactly four legs total: two forelegs connected to the shoulders and two hindlegs. Neutral sit shows all four paws grounded. During grooming, lift the cat’s right foreleg (viewer-left), connected continuously from shoulder through elbow and wrist to the raised paw. This lifted paw replaces one grounded forepaw; every raised-paw frame shows exactly three paws on the floor: the other forepaw and both hind paws. Never show four paws grounded plus a fifth raised paw; never add, duplicate or float a detached paw.

In row-major order: 0 neutral sit, blue eyes open; 1 viewer-left forepaw begins to lift off floor; 2 same elbow bends, paw to chest; 3 connected paw near muzzle; 4 eyes closed as tongue briefly contacts raised paw; 5 eyes closed as paw wipes muzzle; 6 paw lowers, eyes open and blue; 7 return to neutral sit matching frame 0, eyes open and blue. Keep the same visible scale, centered character and seated anchor. No other actions, props, text, clothes, collar, background, shadow, screenshot UI, other animals or extra limbs.

## Inspection notes

The first edit removed the extra viewer-left inner-front ground paw from frames 1–6 but left an open body gap. A second built-in image edit filled that gap with continuous ginger torso pixels while preserving the white bib and raised foreleg. The final image is `cat-groom-c-v2-final.png`; the original generated image remains in this folder for reference. A final small cleanup removed a detached white fleck beside the frame-3 ground paw. The final 1774 × 887 image retains the same grid and metadata coordinates.

All eight repaired frames were inspected at the normalized 128 × 128 display size and enlarged. Frames 1–6 show exactly three grounded white paws (outer viewer-left hind, inner viewer-right forepaw, outer viewer-right hind) and one connected raised paw. Frames 0 and 7 show four grounded paws. The paw-lift, chest, muzzle, tongue-contact, wipe, lower, and neutral transitions read in order. The C master’s face, eye color, ear shape, ginger stripes, white muzzle/chest/paws and right-curled tail are consistent. Faint red fringe pixels remain visible when enlarged.


Ground-paw x intervals in the final source PNG, left to right, frames 1–6: frame 1 [564–607, 670–729, 734–766]; frame 2 [1007–1050, 1114–1172, 1176–1209]; frame 3 [1450–1493, 1557–1616, 1620–1653]; frame 4 [121–163, 228–286, 294–323]; frame 5 [564–607, 670–729, 737–766]; frame 6 [1007–1050, 1113–1172, 1180–1209]. These intervals are full-atlas source x coordinates and were counted from enlarged bottom-paw crops.

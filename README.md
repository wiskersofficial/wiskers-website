# Wiskers layout redesign preview

Prepared 15 October 2026 from the existing Wiskers website checkout. This is a local review version; the production site has not been published or changed.

## Design

Preserves the Wiskers wordmark, palette, Day / Night / Twilight themes, business copy, openable problem statement, interactive question example, contact and legal pages. Staggered statement blocks, comparison tiles, answer card and approach cards provide varied surfaces. The opening cat scene begins seated on “content”, includes a short raised-paw grooming beat, then a back-first fall and midair righting before the cat lands inside the blue “Insight takes input” tile.

Three custom pixel-art yarn balls start on a small shelf beside Follow your curiosity. Each rolls a short distance left, tips forward over the front lip, then drops vertically and hangs at its option. Options remain staggered left to right. There are no lower landing platforms. Labels are Option 1, Option 2, and Option 3. There is no selection, analytics or backend behavior yet. The sprite atlas was generated with the built-in image generation tool; see public/art/yarn-art-notes.txt.

Scrolling is native. Artwork moves continuously with small scroll-linked offsets. Yarn motion combines a short horizontal roll, a forward tip, and a vertical drop, and rewinds with upward scrolling; there is no scroll interception, pinning or snap. Reduced-motion preference presents the completed yarn scene statically and disables offsets and smooth anchor scrolling.

## Preview

Run `npm run dev -- --port 5178` and open http://127.0.0.1:5178/.

Run `npm run build` for production output in dist/. Both index.html and playground.html contain the redesign. The durable, byte-for-byte permanent C visual master is `public/art/cat-master-c/reference.png`; its original source and SHA-256 are recorded beside it in `public/art/cat-master-c/MASTER.txt`. Derive every future cat pose and animation from this reference, with new cat image generation limited to Luna agents. The permanent C master is `public/art/cat-master-c/reference.png`. The Luna-created grooming and falling atlases live in `public/art/cat-groom-c-v2/` and `public/art/cat-fall-c-v1/`; both use a 128 × 128 viewport, shared (64,113) foot anchor and per-frame cell clipping. Older `cat-content` atlases are archived reference material.

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

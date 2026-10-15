# Atlas QA

- Accepted generated source: `transition-atlas.png`, 1448 × 1086 RGBA PNG, 4 × 3 cells at 362 × 362. All 12 cells have matching `cellRects` clips in `atlas.json`; each silhouette fits its own clip at alpha > 230.
- Registered to viewport 128 × 128, anchor (64,113), with one 470 × 445 source view box per frame, preserving a shared scale of 128/470 CSS pixels per source pixel. Frames 0–5 align around the shared free-flight body center (64,70). Frames 6–11 align their low-opacity-free paw baseline to y=113.
- Alpha > 230 bounds in source pixels, and resulting display dimensions at the shared scale: 0: 334×307 (91.0×83.6); 1: 304×297 (82.8×80.9); 2: 317×274 (86.3×74.6); 3: 329×274 (89.6×74.6); 4: 308×313 (83.9×85.2); 5: 338×296 (92.1×80.6); 6: 313×290 (85.2×79.0); 7: 308×278 (83.9×75.7); 8: 323×245 (88.0×66.7); 9: 310×287 (84.4×78.2); 10: 307×299 (83.6×81.4); 11: 283×308 (77.1×83.9).
- The sheet reads as a gradual supine-to-prone twist across frames 0–5, then impact absorption, crouch, and recovery across frames 6–11. Face and blue eyes are visible in the righting poses and seated end poses; the belly-up frames show paw pads as expected. The final seated frame's visible scale is approximately 77 × 84 px, matching the requested ~78 × 85.5 px upright scale. Natural leg spread and compressed silhouettes are wider or lower where the action requires it.
- The first render had stray disconnected edge fragments where generated cell artwork crossed grid boundaries. A focused cleanup kept each cell's largest connected cat silhouette and a 2px antialias fringe, removing detached pieces; bounds and view boxes were then measured again. A 128×128 contact preview was inspected on light and dark backgrounds. A faint generated edge fringe remains; verify the final animation at website size before adoption. No code, CSS, HTML, existing atlas, source image, or other art folder was changed. This is an art atlas only; the application still needs an explicit sequencing implementation.

## Suggested sequence and independent review

Interleave old fall poses (O0–O11) with new frames (N0–N11) in this order:

```text
O0, O1, O2, O3, N0, O4, N1, N2, O5, N3, N4, O6, N5,
O7, O8, O9, N6, N7, O10, N8, N9, N10, N11, O11
```

An independent Luna checker rendered the full 24-pose sequence using the real `cellRects` and global `viewBoxes` at 128×128. It accepted the art: the shoulder-led twist, paw-down contact, compression, and seated recovery read continuously; it found no identity, anatomy, or clip failures. This check did not cover live browser timing or collision integration. Its contact sheet and notes are at `/tmp/luna-art-inspection/full-interleaved24-128.png` and `/tmp/luna-art-inspection/independent-qa.md`.

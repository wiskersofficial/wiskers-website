# Homepage body warp and thesis layout — 20 October 2026

- Production build passed. Existing separate Scrollo bundle warning remains unchanged.
- Production preview reviewed at 1012 × 954, 390 × 844 and 320 × 740. No horizontal overflow at the mobile widths; cuboid stays inside the viewport.
- Thesis lead-in is 31.372px at 1012px (previously 21px), 28px on mobile. Attention sentence sits below the left heading with a 34px gap. Diagram removed from markup, styling and controller wiring.
- 19 initial prose targets enhanced; changing an application remounts its copy and conversation angle. Generated activity paragraphs gain the same effect. Opening details, hovering their copy inside the native scroll pane and resetting the demo worked.
- Reviewed Night and Day appearance. Original colours inherit correctly; hover adds a local accent. Explicit takeaway line break retained in both accessible and visual copies.
- Reviewed pause/resume; new hover stays inactive while paused. The accessibility tree exposes original sentences once, and controls remain usable. Browser console contained no warnings or errors.
- Reduced-motion and touch behavior reviewed in source, not browser-emulated. Two-cycle cuboid mapping unchanged.

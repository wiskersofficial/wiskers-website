# Homepage copy and V2 logo review — 19 October 2026

## Scope

The homepage follows Josh’s New website copy.md. All eight supplied body paragraphs remain verbatim. The old calculator, diagnosis, comparison checklist and decorative labels are replaced with the Wiskers prospect/team demo. The current visitor is the prospect. Header/footer retain navigation, motion/theme controls, contact and legal links.

The V2 W24 primary lockup and icon come from the supplied brand asset pack, applied at Josh’s explicit request. Dark/light SVG geometry is unchanged. Asset provenance and archive hash are in public/assets/brand-v2/README.md. Earlier website routes and cat artwork are preserved.

## Checks performed

- Standard `npm run build`: passed. Existing separate Scrollo route chunk remains 626.18 kB and raises Vite’s 500 kB warning. Its JS and CSS bundle hashes are unchanged by this homepage work.
- Browser review at the default desktop viewport, 1440 × 900, 390 × 844 and 320 × 740. No horizontal document or heading overflow in the inspected layouts.
- Day, Night and Twilight themes: selected through the real control; correct V2 light/dark wordmark loads. Mobile reading order is prospect first, team second.
- Hero font/colour transition progresses on scroll; pause freezes the system, resume restores current scroll state. Shared layout measurement runs after responsive changes and fonts. Closing heading’s last glyph reaches 1.0 at the page end.
- Module preview application changes its text and illustration. Opening details records an action. Comparing approaches reveals useful differences. Selecting an approach changes the preview. Answering the question changes the factual conversation context.
- Native radio choices operated with keyboard Space on mobile viewport; details remain native summaries. Activity updates have a live status region. Labels and focus treatment are retained.
- Section exposure is separate from deliberate actions. Initial section exposure leaves the action list empty. Reset clears choices, expanded details, comparison state and timeline.
- Built production preview: direct load into #experience-tailor, comparison and approach selection work. Header, section and contact anchors reviewed. Contact/CTA hrefs point to hello@wiskers.click; privacy and terms links retained.
- Closing image trail mounts five SVGs; assets load and a pointer interaction positions a trail image. Hanging symbol, flow paths and ASCII fields remain wired to the shared controller.
- Reduced motion support was reviewed in source, not emulated through the browser: stable glyph rendering, disabled trail/sway and static ASCII phase; normal scrolling and controls remain available.
- No browser error/warning messages in the reviewed production interaction flow.
- Static homepage fallback exactly matches exported semantic markup; unique IDs and supplied paragraphs verified. `git diff --check` passes.
- Reusable module source snapshots and ZIP archives refreshed. ZIP integrity checked; current experience module and V2 SVG assets included.

## Data boundary

The new demo state stays in memory. It adds no persistence or network requests. Existing site analytics are unchanged. Conversation suggestions quote explicit choices and propose a question; section exposure never establishes qualification or need.

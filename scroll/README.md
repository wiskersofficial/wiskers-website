# Scrollo concept demo

Route: `/scroll/` (also reachable at `/scroll`). This is an isolated demonstration of a steerable, continuous curiosity feed. It does not change the Wiskers homepage, `/cat/`, contact information, or legal pages.

## Product interpretation and build plan

The primary experience is continuous scrolling through short explanations and living diagrams. Diagonal gestures steer the experience without turning it into a stack of swipe cards. The four actions follow the original requested map:

| Gesture | Action |
| --- | --- |
| Top left | Less like this; reduce related topics and move on |
| Top right | Start a conversation with a friend |
| Bottom left | Like; collect the idea and increase related topics |
| Bottom right | Open the thread for this exact topic |

Separate feed controls change mood, depth, discovery, and interests. Treating bottom-left as a tuning gesture would replace the requested like action, so tuning has its own control.

The implementation uses native vertical scrolling with readable HTML text over one procedural WebGL layer. A full 3D text canvas is not necessary for this experience. No scroll snapping, wheel interception, or pinned article transitions are used. Graphics follow measured document positions, with small differential motion and sideways feedback during deliberate diagonal gestures. The release preserves the original site's route split.

The build has four parts:

1. A prepared library of twelve topics with stable topic IDs, original explanatory copy, source links, and topic-specific demo comments.
2. A continuous responsive layout with procedural graphics, interactive experiments, gesture previews, haptic support where available, and explicit button alternatives.
3. Browser-local social and preference state: likes, dislikes, comments, replies, simulated friend conversations, shared wandering, and feed reordering.
4. Browser review at desktop and narrow widths, production build, dev push, and the repository's standing main release workflow.

## Showing the demo

Open `/scroll/` and scroll normally. The opening harmonic sculpture, galaxy, and living-light scenes make good first stops. Sliders alter the graphics live. The double pendulum uses integrated equations, and the three-door game can be played repeatedly.

The four corner controls mirror the gestures. For a diagonal gesture, begin sideways and move into a corner; release after the action preview says “Release”. A mostly vertical motion remains a normal browser scroll. Gesture decisions have a visual preview, edge colour, and optional vibration on supported devices.

“Make it your flow” opens a gesture and keyboard guide. “Tune your feed” previews and replaces upcoming topics while retaining the current article and reading position. Likes and dislikes also influence upcoming ordering. Source links open an explanation and attribution panel. The explore icon offers topic search. The profile opens liked ideas, motion settings, a guided tour, and reset.

Friend conversations are simulated. “Wander together” adds a labelled demo companion pointer and shared-session indicator. Clicking the indicator ends the shared wander.

The guided flow advances through nine ideas, every 7.5 seconds. Wheel input, touch, or keyboard input cancels it. Reduced motion disables the tour and animated graphics while preserving all reading and social controls. Use “Keep wandering” to append another prepared stretch.

Keyboard shortcuts:

- `J` / `K`: next / previous topic
- `L`: like the current topic
- `C`: comments
- `F`: friends
- `T`: feed tuning
- `?`: interaction guide
- `Escape`: close a panel or cancel a gesture

Panels trap keyboard focus, keep the current topic context, and restore focus when closed. Comments and messages are escaped before rendering. User content is never evaluated or sent to a service.

## Demo boundaries

There is no backend, live AI generation, source ingestion, real social messaging, or external posting. Likes, comments, messages, and preferences are saved to `scrollo-demo-v1` in localStorage on the current browser. The reset control clears only that demo state. Background sound is synthesised locally and starts only after a user clicks the audio control.

All artwork is drawn from code. No generated bitmap, stock video, or article image is needed. Illustrations are explicitly conceptual; they are not observational data or physical simulations unless the explanation says otherwise. The source drawer links to NASA, NOAA, the University of Toronto, the Exploratorium, and the cited network research. Linking a source here does not establish rights for a future ingestion pipeline.

The font request uses Google Fonts; system fonts are fallbacks if unavailable. The demo otherwise needs only the website's existing Three.js and Vite dependencies.

## Source map

- `scroll/index.html`: isolated route and fixed UI chrome
- `src/scroll/data.js`: prepared topic library, attribution, icons
- `src/scroll/app.js`: feed ordering, panels, local state, experiments, gestures, sound, and tour
- `src/scroll/world.js`: procedural geometry, particles, shaders, bloom, scene lifecycle
- `src/scroll/scroll.css`: responsive typography, composition, and interactions
- `public/scroll-icon.svg`: route-specific favicon
- `vite.config.js`: adds the route to the existing multi-page build

The graphics layer creates scenes only when they approach the viewport and disposes removed scenes when the future feed changes. Pixel ratio is capped at 1.6. Native scrolling remains usable without WebGL, using a CSS visual fallback. The development server places frame timing diagnostics on the canvas as data attributes; they do not add visible production UI.

## Local preview and build

Use the existing dependencies:

```sh
npm run dev -- --host 127.0.0.1 --port 5190 --configLoader runner
npm run build -- --configLoader runner
```

Build output includes `dist/scroll/index.html` alongside the existing root and `/cat/` pages.

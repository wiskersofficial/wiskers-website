# Scrollo: a continuous, gesture-led feed

Public routes: `/scrollo/` and `/scroll/`. The same HTML source is built at both addresses. Root Wiskers pages and `/cat/` are unchanged.

## Current experience

The feed combines photographs, short headlines, quoted social exchanges, moving typography, visual wordplay, and procedural models. There are no per-scene sliders, feed-tuning forms, snap points, or next-card controls. Scrolling transforms images, letters, and models; the next moments enter while the preceding ones are still leaving. The prepared mix includes current news, politics, environment, tech, music, internet humour, art, and occasional science.

The four original corner actions remain:

| Direction | Action |
| --- | --- |
| Top left | Less of this; change the mix and move on |
| Top right | Bring a friend into a topic-linked demo conversation |
| Bottom left | Like and ask for more related material |
| Bottom right | Comments on the current topic |

A short diagonal drag progressively lights the thin corner bezel. An armed gesture lights the whole path. Release commits, requests a haptic pulse where supported, and confirms with a new colour. A short or cancelled swipe returns to rest without acting. A positive swipe is consistently positive, including repeated swipes on a liked item.

## Gesture mechanics

The former `touch-action: pan-y` handler let the browser own and cancel diagonal pointers before the application claimed them. The new feed claims a primary pointer immediately and uses `touch-action: pinch-zoom`. Vertical pointer drags move the actual document, with velocity-based coast on release. Desktop wheel scrolling and keyboard scrolling remain native. Diagonal trackpad movement is supported separately through a cancellable wheel listener.

Pointer intent is classified after a small movement. Vertical intent stays vertical; diagonal intent previews an action. Both axes must contribute before a corner action can arm. Pointer cancellation and window blur cancel the action. Text selection and image dragging do not take over a feed swipe. Gestures can begin over source labels as well as text and images; a tap still opens the source.

Source, social, and settings sheets keep normal internal vertical scrolling. A rightward swipe dismisses a sheet. Closing stops intercepting feed input immediately, while the visual transition finishes.

Corner buttons and keyboard controls are retained as accessible alternatives. `J` / `K` scroll; `L`, `C`, and `F` invoke like, comments, and friends; `?` opens help; `Escape` closes a panel. Dialogs trap focus and restore it on dismissal.

## Haptics

The implementation requests the real Vibration API on arm and confirmation. A web page cannot force physical feedback on browsers or hardware that do not expose it. In particular, Safari and desktop hardware may provide no usable web vibration. No unsupported iOS checkbox trick is presented as reliable haptics. The bezel preview, threshold, and colour confirmation always remain available.

Reference: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate

## Content and provenance

News snapshot checked **18 October 2026**. Dated reporting includes:

- COP17 opening day and the 19–30 October biodiversity conference, from the Convention on Biological Diversity.
- Portugal housing and cost-of-living demonstrations, from Euronews, 17 October.
- Sponge-city approaches to urban water, from Euronews, 17 October.
- Research into Martian building materials inspired by freeze-dried fruit, from Euronews, 17 October.
- An adviser's concerns about the siting of AI data centres, from Euronews, 17 October.
- Brussels' pumpkin festival, from Euronews Culture, 17 October.

Reddit excerpts link to their actual original threads and are labelled as archive material. The medieval-music exchange is from r/musictheory; the work-tomorrow quote is from a dated r/CasualUK thread. The YouTube moment links to NPR Music's Dua Lipa Tiny Desk home concert. The Bluesky explainer links to the platform's own custom-feed explanation. No invented platform usernames, engagement counts, or live popularity claims are shown.

Each source panel includes the exact source URL, date, context, and image credit. News imagery is illustrative and is not represented as photography of a reported event. This is a prepared demo, not a live source-ingestion or news service.

## Images

Three licensed Unsplash photographs are stored locally for reliable loading, under the Unsplash license (https://unsplash.com/license):

- `public/scroll-media/cat.jpg`: Gaelle Marcel, https://unsplash.com/photos/an-orange-cat-sleeps-peacefully-on-a-bed-f6ZQIQ6wAmE
- `public/scroll-media/forest.jpg`: Red Zeppelin, https://unsplash.com/photos/aerial-photography-of-forest-with-trees-QgFAMvj8JXY
- `public/scroll-media/lisbon.jpg`: elisadventure, https://unsplash.com/photos/h5kfWB9c8lA

The music moment uses the original YouTube thumbnail as a link preview, credited to NPR Music. It does not download or autoplay the performance.

Models, rain, geometry, and other graphics are generated from code. No external model assets are required. Objects approach, rotate, assemble, or change with the document's scroll position. Reduced motion keeps content and actions usable while suppressing moving graphics and type.

## State and feed adaptation

Likes, hidden topics, affinity weights, comments, and simulated chats use `scrollo-flow-v2` in localStorage. There is no real messaging, external posting, or live AI backend. All user text is escaped before rendering. A reset starts a fresh mix without touching the website's other stored preferences.

Likes and skips reorder the future mix. The current topic and the next visible moments are retained to avoid moving content under the reader. Topic IDs, rather than feed positions, own the social context. Additional prepared content appends as the reader approaches the end. Distant WebGL objects are disposed and recreated when needed; the scrolling document and topic history remain available.

## Source map and build

- `scroll/index.html`: minimal chrome, corner bezel paths, feed, social sheet
- `src/scroll/gestures.js`: pointer arbitration, drag scrolling, momentum, trackpad gestures, bezel and haptic feedback
- `src/scroll/app.js`: continuous composition, scroll-driven type, adaptation, source context, local social interactions
- `src/scroll/data.js`: mixed prepared content, exact source links, attribution, and demo replies
- `src/scroll/icons.js`: shared UI icons
- `src/scroll/world.js`: procedural models and graphics, scroll transforms, resource lifecycle
- `src/scroll/scroll.css`: responsive overlapping layouts, typography, bezels, dialogs, and reduced motion

Use the existing dependencies:

```sh
npm run dev -- --host 127.0.0.1 --port 5190 --configLoader runner
npm run build -- --configLoader runner
```

The build preserves both demo addresses and the existing root and cat entry points. Follow the repository's dev-to-main Cloudflare release workflow.

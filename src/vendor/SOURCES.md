# Pitch deck primitive sources

- **Molten Glass DOM Lens** — rubjo/molten-glass, pinned commit `1894290d0195b1e6a493db2d590b929370c79377`, MIT. Source and licence are preserved in `molten-glass/`. The optional html2canvas dynamic import is replaced with an injection requirement because this deck supplies a canvas source and performs no DOM capture.
- **3D Technical Linework** — isaacrowntree/linework, pinned commit `7e4b8b883d724cb95cc814ff3cbf93647e0c00db`, MIT. Browser renderer and sketch API are preserved in `linework/`, with licence. The modular engine geometry is original deck artwork.
- **3D Wave Grid** — deck-specific Three.js instanced-cube implementation of the interactive wave-grid pattern selected from franky-adl/3d-wave-grid (MIT). Unlike the earlier homepage wrapper, this implementation colours each cube from its actual wave displacement and uses a perspective view. The upstream notice is retained at `/public/assets/lead-moment/LICENSE-wave-grid.txt`. Three.js is the repository's installed dependency and retains its own MIT licence.

The founder photograph was supplied by Josh. Its local JPEG is an optimised derivative; the supplied original is unchanged.

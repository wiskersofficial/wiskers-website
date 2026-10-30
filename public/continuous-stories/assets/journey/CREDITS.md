# Journey — asset sources

All assets are served locally; there are no runtime requests to asset providers or their APIs. Asset receipts contain download URLs, byte sizes and SHA-256 checksums. The scene contains only Josh’s two requested phrases; credits live here rather than adding text to the cinematic view.

## Poly Haven — CC0

License verified 26 October 2026: https://polyhaven.com/license

- Flower Heliophila — Jenelle van Heerden: https://polyhaven.com/a/flower_heliophila
- Flower Ursinia: https://polyhaven.com/a/flower_ursinia
- Flower Empodium: https://polyhaven.com/a/flower_empodium
- Grass Medium 01: https://polyhaven.com/a/grass_medium_01
- Coast Sand 01 — Rob Tuytel: https://polyhaven.com/a/coast_sand_01
- Cobblestone Street Night: https://polyhaven.com/a/cobblestone_street_night
- Meadow 2 — Sergej Majboroda: https://polyhaven.com/a/meadow_2
- Grass Path 2 — Rob Tuytel: https://polyhaven.com/a/grass_path_2

Selected 1K glTF/PBR/HDR assets. Powered by Poly Haven asset discovery; the build-time public API supplied file manifests, not the runtime experience.

## Grab3D — CC0

Modern Car Interior: https://grab3d.com/models/vehicles/modern-car-interior/
Direct original GLB: https://grab3d.com/dl/modern-car-interior/modern-car-interior.glb
License was explicitly CC0 on the primary asset page, checked 26 October 2026. The central roof triangles are omitted for first-person framing; the cockpit is otherwise the source model with restrained glass/emissive adjustments.

## Original scene geometry

City blocks/window instances/rooflines, bascule drawbridge/rails, island terrain/palms, ocean shader, meadow stems/petals/grass, lettering choreography and camera path were created for this demo. No purchased assets, accounts, or branded vehicle likenesses were required.

## Runtime and typeface

Three.js 0.180.0 from the official npm package, MIT; see ../../vendor/three/LICENSE. Helvetiker font and its original notice: ../../vendor/three/examples/fonts/LICENSE. Only the dependency closure used by this scene is bundled.

# Wiskers cat animation library

All cat sprites loaded by the website are Wiskers-generated art. Each PNG is a transparent four-frame strip with identical 80 × 64 cells, a shared foot anchor, and a consistent pixel-art palette. Source sheets are kept in the local generated-art library; only normalized strips are included in the website.

## Direction and movement

- `IDLE_FRONT.png`, `WALK_FRONT.png`, `WALK_BACK.png`, `WALK_SIDE.png`, `DIAGONAL.png`
- `RUN_FRONT.png`, `RUN_BACK.png`, `RUN_SIDE.png`
- `JUMP_FRONT.png`, `JUMP_SIDE.png`, `POUNCE.png`
- `CLIMB.png`, `SLIP.png`, `TWIST.png`, `RECOVER.png`

## Reactions and interaction

- `PEEK.png`, `LOOKDOWN.png`, `CURIOUS.png`
- `PAW_FRONT.png`, `PAW_SIDE.png`, `REACH.png`
- `SCARE.png`

## Rest and routine

- `SLEEP.png`, `WAKE.png`, `STRETCH.png`, `LICK.png`, `EAT.png`

The fall is staged as `SLIP` → `TWIST` → `RECOVER`. Directional walk and run clips are selected from the cat's movement through the page. The reduced-motion control and system preference remain respected.

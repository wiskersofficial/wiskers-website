# Wiskers website review map v1

The temporary map on the live homepage divides the continuous scroll into five numbered chapters. Solid green outlines mark a current cat route or action. Dashed coral outlines mark a proposed interaction surface; they do not yet make the cat react. The problem statement remains an openable header panel, and Privacy and Website terms remain separate pages.

| Page | Reference | Surface | Status |
| --- | --- | --- | --- |
| 01 Welcome | 1A | Cat shelf | Current route |
| 01 Welcome | 1B | Headline | Possible interaction |
| 02 The difference | 2A | Bridge | Current route |
| 02 The difference | 2B | Climb and slide wall | Current route |
| 02 The difference | 2C | PDF card | Current paw and shake interaction |
| 02 The difference | 2D | Tool preview | Possible interaction |
| 03 Try it | 3A | Buyer question choice | Possible cat interaction; the selector itself already works |
| 03 Try it | 3B | Answer card | Current pounce and bounce interaction |
| 04 Our approach | 4A | Cat ledge | Current route |
| 04 Our approach | 4B | Find the real question | Possible interaction |
| 04 Our approach | 4C | Make the answer interactive | Possible interaction |
| 04 Our approach | 4D | Put it to work | Possible interaction |
| 05 Contact | 5A | Snack ledge and bowl | Current route and eat interaction |
| 05 Contact | 5B | Contact panel | Possible interaction |

The map is implemented in `src/review-map.js` and `src/review-map.css` and imported once by `src/playground.js`. Remove that import to remove the review layer without changing the cat animation engine.

The cat is displayed 15% smaller than the previous build. The website now loads a Wiskers-generated sprite library only: 27 four-frame clips covering front, back, side and diagonal views; walking, running, jumping, pouncing and climbing; pawing and page-specific reactions; falling, twisting and landing; plus eating, grooming, sleeping and waking. Movement selects a front, back, side or diagonal walk/run from the cat's path through the page. The ledge sequence remains SLIP → TWIST → RECOVER. PEEK plays at the welcome perch; LOOKDOWN at the approach chapter; CURIOUS after the cat pounces onto an answer; REACH when the buyer-question choice changes; STRETCH and LICK after idle pauses; and SLEEP after a longer pause. The purchased template sprite sheets have been removed from the site bundle.

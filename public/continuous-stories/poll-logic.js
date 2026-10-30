export const baseline={antonelli:34,norris:29,verstappen:22,leclerc:15};
export function pullIntent(dx,dy){if(Math.hypot(dx,dy)<9)return null;if(Math.abs(dy)>Math.abs(dx)*1.15)return 'scroll';return dx>0&&dx>Math.abs(dy)*1.25?'pull':'idle'}
export function pullAmount(dx,travel){const distance=Math.max(0,Math.min(travel,dx));return {distance,progress:distance/Math.max(1,travel),armed:distance>=Math.max(1,travel)*.64};}
export function results(choice){return Object.fromEntries(Object.entries(baseline).map(([key,n])=>[key,((n+(key===choice?1:0))/(choice?101:100)*100).toFixed(1)]));}

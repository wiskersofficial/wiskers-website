export function twoFingerIntent(start,now){
 if(start.length!==2||now.length!==2)return null;
 const delta=start.map(s=>{const n=now.find(t=>t.id===s.id);return n?{x:n.x-s.x,y:n.y-s.y}:null});if(delta.some(d=>!d))return null;
 const spread=a=>Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
 if(Math.abs(spread(now)-spread(start))>Math.max(24,spread(start)*.2))return null;
 const dy=(delta[0].y+delta[1].y)/2,dx=(delta[0].x+delta[1].x)/2;
 if(Math.abs(dy)<64||delta.some(d=>Math.sign(d.y)!==Math.sign(dy)||Math.abs(d.y)<38)||Math.abs(dx)>Math.abs(dy)*.6)return null;
 return dy>0?'auto':'menu';
}
export function autoStep(position,velocity,dt,max){const elapsed=Math.max(0,Math.min(48,dt)),speed=velocity+(300-velocity)*(1-Math.exp(-elapsed/180)),next=Math.min(max,position+speed*elapsed/1000);return {position:next,velocity:speed,done:max-next<.25};}

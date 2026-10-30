export const THREAD_EDGES=[[0,3],[1,2],[1,4],[2,5],[3,4],[3,6],[4,5],[4,7],[5,8],[6,7],[7,8]];
export function threadStep(path,node){
 if(!Number.isInteger(node)||node<0||node>8)return path;
 if(!path.length)return node===0?[0]:path;
 if(path.at(-2)===node)return path.slice(0,-1);
 if(path.includes(node)||!THREAD_EDGES.some(([a,b])=>a===path.at(-1)&&b===node||b===path.at(-1)&&a===node))return path;
 return [...path,node];
}
export const threadWon=path=>path.length===9&&path[0]===0&&path[8]===8;
// Directions clockwise: north, east, south, west. Canonical pieces form a winding river.
export const RIVER_BASE=[[3,1],[3,1],[3,2],[1,2],[1,3],[0,3],[0,1],[3,1],[3,1]];
export const RIVER_START=[1,0,2,3,1,2,1,0,1];
export const riverPorts=(cell,turns)=>RIVER_BASE[cell].map(d=>(d+turns%4+4)%4);
export function riverWalk(turns){
 let cell=0,entry=3;const path=[];
 while(cell>=0&&cell<9&&!path.includes(cell)){
  const ports=riverPorts(cell,turns[cell]);if(!ports.includes(entry))break;
  path.push(cell);const exit=ports.find(d=>d!==entry),row=Math.floor(cell/3),col=cell%3;
  if(cell===8&&exit===1)return {path,won:path.length===9};
  if(exit===0&&row===0||exit===1&&col===2||exit===2&&row===2||exit===3&&col===0)break;
  cell+=[-3,1,3,-1][exit];entry=(exit+2)%4;
 }
 return {path,won:false};
}

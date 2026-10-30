export const WORD_LINKS=[
 {id:'paper',partner:'PAPER',side:'before',words:['BACK','CLIP','CUT','TRAIL'],compatible:['BACK','CLIP','CUT','TRAIL']},
 {id:'light',partner:'LIGHT',side:'after',words:['MOON','SPOT','DAY','HIGH'],compatible:['MOON','SPOT','DAY','HIGH','BACK','KEY','GREEN']},
 {id:'board',partner:'BOARD',side:'after',words:['KEY','SKATE','STORY','DASH'],compatible:['KEY','SKATE','STORY','DASH','BACK','CLIP']},
 {id:'house',partner:'HOUSE',side:'after',words:['GREEN','GLASS','WARE','COURT'],compatible:['GREEN','GLASS','WARE','COURT']}
];
export const WORD_ORDER=['STORY','GREEN','CLIP','DAY','COURT','BACK','HIGH','SKATE','MOON','WARE','CUT','KEY','GLASS','SPOT','DASH','TRAIL'];
function combos(list,n){if(!n)return [[]];return list.flatMap((w,i)=>combos(list.slice(i+1),n-1).map(rest=>[w,...rest]));}
export function wordPartitions(remaining=WORD_ORDER,links=WORD_LINKS){
 if(!remaining.length)return [[]];const first=remaining[0],out=[];
 for(const link of links){if(!link.compatible.includes(first))continue;const others=remaining.filter(w=>w!==first&&link.compatible.includes(w));
  for(const part of combos(others,3)){const group=[first,...part],rest=remaining.filter(w=>!group.includes(w));for(const tail of wordPartitions(rest,links.filter(l=>l.id!==link.id)))out.push([{id:link.id,words:group},...tail]);}
 }return out;
}
export function judgeWords(selection,solved=[]){
 const links=WORD_LINKS.filter(l=>!solved.includes(l.id)),remaining=WORD_ORDER.filter(w=>!WORD_LINKS.some(l=>solved.includes(l.id)&&l.words.includes(w)));
 if(selection.length!==4||new Set(selection).size!==4||selection.some(w=>!remaining.includes(w)))return {kind:'incomplete'};
 const matches=links.filter(l=>selection.every(w=>l.compatible.includes(w)));
 for(const l of matches)if(wordPartitions(remaining.filter(w=>!selection.includes(w)),links.filter(x=>x.id!==l.id)).length)return {kind:'correct',id:l.id};
 if(matches.length)return {kind:'stranded'};
 if(links.some(l=>selection.filter(w=>l.words.includes(w)).length===3))return {kind:'near'};
 return {kind:'wrong'};
}
export const RIVER_SIZE=5;
export const RIVER_PATH=[0, 5, 6, 1, 2, 3, 4, 9, 14, 13, 8, 7, 12, 11, 10, 15, 20, 21, 16, 17, 22, 23, 18, 19, 24];
export const RIVER_BASE=[[3, 2], [2, 1], [3, 1], [3, 1], [3, 2], [0, 1], [3, 0], [1, 2], [2, 3], [0, 2], [1, 2], [1, 3], [0, 3], [1, 0], [0, 3], [0, 2], [2, 1], [3, 2], [2, 1], [3, 2], [0, 1], [3, 0], [0, 1], [3, 0], [0, 1]];
export const RIVER_MARKERS=[4, 11, 22];
export const RIVER_START=[2, 2, 1, 1, 3, 2, 1, 2, 1, 3, 3, 1, 3, 1, 1, 3, 1, 1, 2, 3, 1, 3, 3, 1, 3];
export const riverPorts=(cell,turns)=>RIVER_BASE[cell].map(d=>(d+turns%4+4)%4);
export const riverAligned=(cell,turns)=>riverPorts(cell,turns).every(p=>RIVER_BASE[cell].includes(p));
export function riverWalk(turns){
 if(!Array.isArray(turns)||turns.length!==25||turns.some(t=>!Number.isInteger(t)))return {path:[],passed:[],orderOK:true,won:false};
 let cell=0,entry=3;const path=[],passed=[];
 while(cell>=0&&cell<25&&!path.includes(cell)){
  const ports=riverPorts(cell,turns[cell]);if(!ports.includes(entry))break;path.push(cell);
  const marker=RIVER_MARKERS.indexOf(cell);if(marker>=0)passed.push(marker+1);
  const exit=ports.find(d=>d!==entry),row=Math.floor(cell/5),col=cell%5;
  if(cell===24&&exit===1){const orderOK=passed.every((n,i)=>n===i+1);return {path,passed,orderOK,won:path.length===25&&orderOK&&passed.length===3};}
  if(exit===0&&row===0||exit===1&&col===4||exit===2&&row===4||exit===3&&col===0)break;
  cell+=[-5,1,5,-1][exit];entry=(exit+2)%4;
 }
 const orderOK=passed.every((n,i)=>n===i+1);return {path,passed,orderOK,won:false};
}

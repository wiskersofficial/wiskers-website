// Original paper-cut shapes and hand-drawn letter paths. Every part follows scroll position.
const glyphs={
 I:'M6 7L30 7M18 7L18 55M5 55L31 55',
 S:'M31 12Q23 2 12 9Q0 17 10 29L25 35Q38 43 27 53Q16 63 6 51',
 d:'M28 4L28 55Q9 62 7 41Q5 24 20 24Q27 24 28 34',
 e:'M7 39Q38 42 28 27Q20 15 10 28Q-1 45 13 55Q23 61 32 51',
 s:'M31 27Q16 16 9 29Q4 37 21 40Q38 46 27 54Q16 62 6 51',
 t:'M19 9L17 48Q17 62 30 54M6 26L31 24',
 i:'M18 27L17 54M19 9L19 10',
 n:'M7 56L8 25M8 36Q24 14 30 33L30 55',
 a:'M29 29Q15 17 8 32Q-1 51 13 56Q24 60 29 42M29 27L30 55',
 o:'M19 24Q3 22 6 42Q7 60 22 55Q36 49 30 32Q26 23 19 24',
 h:'M8 5L7 56M8 36Q24 14 30 33L29 56'
};
const ink='#35525a',cream='#fff2d1',colors=['#e9b44f','#e69582','#81b7ae','#b3bd78','#bd9fb8'];
const clamp=x=>Math.min(1,Math.max(0,x));
const ease=x=>x*x*(3-2*x);
const phase=(p,a,b)=>ease(clamp((p-a)/(b-a)));
function attrs(at,duration=.035){return `data-at="${at.toFixed(4)}" data-until="${(at+duration).toFixed(4)}"`;}
function drawPath(d,color,width,at,extra=''){
 return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" data-draw ${attrs(at)} ${extra}/>`;
}
function ribbon(d,color,at,width=34){
 return `<g class="paper-ribbon">${drawPath(d,ink,width+3,at)}${drawPath(d,color,width,at)}${drawPath(d,cream,1,at+.009,'opacity=".45"')}</g>`;
}
function leaf(x,y,rotation,size,color,at){return `<g transform="translate(${x} ${y}) rotate(${rotation}) scale(${size})"><g data-grow ${attrs(at,.028)}><path d="M0 0C-30-18-23-48 0-62C24-43 28-18 0 0Z" fill="${color}" stroke="${ink}" stroke-width="1.5"/><path d="M0-3L0-54M0-18L-12-30M0-31L11-42" fill="none" stroke="${ink}" stroke-width="1.2"/></g></g>`;}
function flower(x,y,size,color,at,count=8){
 let out=`<g transform="translate(${x} ${y}) scale(${size})"><g class="paper-bloom">`;
 for(let j=0;j<count;j++){
 const angle=j*360/count,petalColor=j%3===1?cream:color;
 out+=`<g transform="rotate(${angle})"><g data-grow ${attrs(at+j*.0025,.023)}><path d="M0 1C-11-7-18-31-8-43C0-51 13-39 11-26C10-14 5-4 0 1Z" fill="${petalColor}" stroke="${ink}" stroke-width="1.5"/><path d="M0-6Q-4-21-1-34" fill="none" stroke="#ffffff" stroke-width="1.5" opacity=".4"/></g></g>`;
 }
 out+=`<g data-grow ${attrs(at+count*.0025,.022)}><circle r="13" fill="${cream}" stroke="${ink}" stroke-width="2"/><circle r="7" fill="${color}" stroke="${ink}" stroke-width="1.5"/><path d="M-4-5Q1-8 5-3" stroke="white" stroke-width="2" fill="none" opacity=".6"/></g></g></g>`;
 return out;
}
function word(text,x,y,scale,at,step=40){
 let out=`<g transform="translate(${x} ${y}) scale(${scale})">`;
 [...text].forEach((char,i)=>{
  if(char===' ')return;
  const begin=at+Math.floor(i/3)*.013,color=colors[(i+2)%colors.length],tilt=[-4,3,-2,4,-3,1][i%6];
  out+=`<g transform="translate(${i*step} ${i%2?1:-1}) rotate(${tilt} 18 32)"><g data-letter ${attrs(begin,.027)}>`;
  for(const [stroke,width,delay] of [[cream,19,0],[ink,14,.001],[color,10,.003]])out+=drawPath(glyphs[char],stroke,width,begin+delay);
  out+='</g></g>';
 });
 return out+'</g>';
}
export function createPaperWave(host){
 let svg=`<svg viewBox="0 0 420 720" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="waveBlue" x2=".25" y2="1"><stop stop-color="#87b9c8"/><stop offset=".55" stop-color="#acd1d8"/><stop offset="1" stop-color="#d2dfcb"/></linearGradient><filter id="wavePaperShadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="1.2" dy="2.5" stdDeviation="1.3" flood-color="#183d47" flood-opacity=".23"/></filter><pattern id="wavePaperFiber" width="41" height="37" patternUnits="userSpaceOnUse"><path d="M2 4l4 1M18 12l3-1M32 24l5 1M9 31l3-1" stroke="#fff6d5" stroke-width=".6" opacity=".18"/></pattern></defs><rect width="420" height="720" fill="url(#waveBlue)"/><rect width="420" height="720" fill="url(#wavePaperFiber)"/>`;
 svg+='<g data-paper-foreground>';
 // Broad curving banners unfurl in different directions behind the botanical wave.
 svg+=ribbon('M-55 654C58 696 69 518 175 562S338 640 473 538','#689fa0',.829,35);
 svg+=ribbon('M466 104C302 12 337 200 190 133S33 151-48 54','#d69a86',.854,29);
 svg+=ribbon('M-45 340C65 258 99 157 51-35','#d8bd76',.844,26);
 svg+=ribbon('M455 388C320 291 454 172 379-32','#aab786',.869,32);
 svg+=ribbon('M-39 761C93 612 263 741 476 659','#b6a1ba',.841,36);
 // A single directional current; stems and swirls draw before their leaves and petals.
 const vines=[
 ['M-25 681C104 704 54 530 129 498C163 483 165 530 134 534C106 537 103 512 118 503',.831],
 ['M389 749C285 679 366 574 308 511C287 490 263 505 275 523C286 540 310 526 298 512',.845],
 ['M26 505C-25 411 89 348 55 264C40 229 14 260 35 274C59 290 73 259 52 244',.862],
 ['M413 491C323 449 406 351 348 283C316 247 285 271 306 292C327 314 350 280 326 269',.87],
 ['M67 213C30 153 124 129 122 79C121 44 78 59 88 83C98 107 134 87 118 67',.888],
 ['M401 207C332 163 367 91 307 84C275 81 267 113 286 116C310 120 312 92 296 92',.896]
 ];
 for(const [d,at] of vines){svg+=drawPath(d,cream,8,at)+drawPath(d,ink,3,at+.003);}
 const leaves=[[58,632,-60,1.05,0],[98,569,20,.8,1],[308,614,49,1.1,2],[338,559,-26,.8,3],[49,435,-45,.8,4],[82,385,38,.7,5],[365,415,43,.9,6],[340,325,-33,.8,7],[53,215,-45,.85,8],[103,153,35,.65,9],[342,182,48,.85,10],[310,123,-25,.7,11]];
 for(const [x,y,r,size,i] of leaves)svg+=leaf(x,y,r,size,colors[(i+2)%5],.843+i*.004);
 const blooms=[[43,627,.92,0],[155,613,.68,1],[352,635,1,2],[292,547,.62,3],[45,450,.67,4],[365,435,.65,5],[53,269,.8,6],[350,286,.88,7],[116,177,.67,8],[298,150,.86,9],[198,91,.5,10]];
 for(const [x,y,size,i] of blooms)svg+=flower(x,y,size,colors[i%5],.85+i*.006,i%3===0?10:8);
 // Small folded stars and seed cut-outs complete the moving current.
 for(let i=0;i<12;i++){const x=[126,235,390,18,195,277,79,321,170,390,227,32][i],y=[691,653,535,354,566,205,97,55,146,181,505,104][i],at=.875+i*.005;svg+=`<g transform="translate(${x} ${y}) rotate(${i*27})"><g data-grow ${attrs(at,.024)}><path d="M0-9L3-3 10-1 4 3 4 10-1 5-8 8-5 1-10-4-3-4Z" fill="${i%2?cream:'#dfb36f'}" stroke="${ink}" stroke-width="1"/></g></g>`;}
 // Every glyph is an original Bézier drawing, revealed in groups of three.
 svg+=word('IS the',100,259,.92,.896,39);
 svg+=word('destination',32,348,.84,.916,39);
 for(let i=0;i<3;i++)svg+=`<g transform="translate(${69+i*10} 301)"><g data-grow ${attrs(.896,.024)}><circle r="2.5" fill="${cream}" stroke="${ink}" stroke-width="1"/></g></g>`;
 // A finishing flourish draws under the letterforms, rather than enclosing a frame.
 svg+=drawPath('M69 427C148 409 241 442 350 417',cream,8,.959)+drawPath('M69 427C148 409 241 442 350 417',ink,2,.961);
 svg+='</g></svg>';host.innerHTML=svg;
 const drawn=[...host.querySelectorAll('[data-draw]')].map(el=>({el,a:+el.dataset.at,b:+el.dataset.until}));
 const grown=[...host.querySelectorAll('[data-grow],[data-letter]')].map(el=>({el,a:+el.dataset.at,b:+el.dataset.until,letter:el.hasAttribute('data-letter')}));
 return function update(p,reduced=false){
  host.style.opacity=String(phase(p,.795,.828));
  for(const {el,a,b} of drawn){const t=phase(p,a,b);el.style.strokeDashoffset=String(1-t);el.style.opacity=String(t>0?1:0);}
  for(const {el,a,b,letter} of grown){const t=phase(p,a,b);el.style.opacity=String(t);el.setAttribute('transform',reduced?'':letter?`translate(0 ${(1-t)*18}) scale(1 ${.65+.35*t})`:`rotate(${(1-t)*-32}) scale(${Math.max(.001,t)} ${Math.max(.001,t*t)})`);}
 };
}

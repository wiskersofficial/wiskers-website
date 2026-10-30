// Presenter-controlled reveals: once a point arrives it stays visible.
export function mountOpeningReveal(section,{selector,interval=1300,startDelay=250,onTime=()=>{}}={}){
 const items=[...section.querySelectorAll(selector)],skip=section.querySelector('[data-reveal-skip]');
 let frame=0,running=false,reduced=false,elapsed=0,last=0;
 section.classList.add('is-revealing');
 function paint(){onTime(elapsed,reduced);const count=reduced?items.length:Math.max(0,Math.floor((elapsed-startDelay)/interval)+1);items.forEach((item,i)=>item.classList.toggle('is-revealed',i<count));const complete=count>=items.length;section.classList.toggle('reveal-complete',complete);skip.hidden=complete;return complete;}
 function tick(now){frame=0;if(!running||reduced)return;if(last)elapsed+=Math.min(100,now-last);last=now;if(!paint())frame=requestAnimationFrame(tick);}
 function play(){running=true;last=0;if(!paint()&&!frame&&!reduced)frame=requestAnimationFrame(tick);}
 function pause(){running=false;cancelAnimationFrame(frame);frame=0;last=0;}
 function finish(){elapsed=startDelay+interval*items.length+1000;paint();}
 skip.addEventListener('click',finish);paint();
 return {play,pause,replay(){elapsed=0;paint();play();},setReduced(value){reduced=value;if(value){elapsed=startDelay+interval*items.length+1000;cancelAnimationFrame(frame);frame=0;paint();}else{paint();if(running)play();}},finish};
}

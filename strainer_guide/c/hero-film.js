const soundIcon=muted=>`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 4 6 8H3v8h3l5 4V4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>${muted?'<path d="m16 9 5 6m0-6-5 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>':'<path d="M15 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'}</svg>`;
export function initHeroFilm() {
 const host=document.querySelector('.hero-film'),video=host?.querySelector('video');
 if(!video)return;
 const button=host.querySelector('.hero-film-start'),sound=host.querySelector('.hero-film-sound'),loading=host.querySelector('.hero-film-loading'),error=host.querySelector('.hero-film-error');
 const allowAuto=!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.connection?.saveData;
 let inView=false,held=false,request=0,timer;
 video.muted=true;
 const label=()=>video.setAttribute('aria-label',`${video.paused?'播放':'暫停'}完整影片`);
 const updateSound=()=>{sound.innerHTML=soundIcon(video.muted);sound.setAttribute('aria-label',`${video.muted?'開啟':'關閉'}完整影片聲音`);sound.setAttribute('aria-pressed',String(!video.muted));};
 const done=()=>{clearTimeout(timer);loading.hidden=true;button.removeAttribute('aria-busy');};
 const fail=()=>{done();error.hidden=false;button.hidden=true;};
 async function play() {
  const token=++request;error.hidden=true;button.hidden=true;loading.hidden=false;button.setAttribute('aria-busy','true');
  clearTimeout(timer);timer=setTimeout(()=>{if(token===request)fail();},30000);
  if(!video.getAttribute('src')||video.error){video.src=video.dataset.src;video.load();}
  if(video.ended)video.currentTime=0;
  try{await video.play();if(token===request)done();}
  catch(e){if(token!==request)return;done();if(e.name==='NotAllowedError'||e.name==='AbortError')button.hidden=false;else fail();}
 }
 const leave=()=>{++request;done();video.pause();};
 const enter=()=>{if(inView&&!held&&!document.hidden&&allowAuto)play();};
 const toggle=()=>{if(!video.paused){held=true;leave();button.hidden=false;}else{held=false;play();}};
 video.addEventListener('click',toggle);
 video.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle();}});
 button.addEventListener('click',()=>{held=false;play();});
 sound.addEventListener('click',()=>{video.muted=!video.muted;updateSound();});
 host.querySelector('.hero-film-retry').addEventListener('click',()=>{held=false;video.load();play();});
 video.addEventListener('play',()=>{button.hidden=true;button.setAttribute('aria-label','播放完整影片');button.querySelector('.hero-film-play').textContent='▶';label();document.querySelectorAll('.video-guide video').forEach(v=>v.pause());if(!inView||document.hidden)leave();});
 video.addEventListener('pause',label);
 video.addEventListener('playing',done);
 video.addEventListener('waiting',()=>{if(inView&&!held)loading.hidden=false;});
 video.addEventListener('error',fail);
 video.addEventListener('ended',()=>{done();held=true;button.hidden=false;button.setAttribute('aria-label','重播完整影片');button.querySelector('.hero-film-play').textContent='↻';label();});
 const observer=new IntersectionObserver(entries=>{
  const entry=entries.at(-1),height=entry.boundingClientRect.height,available=entry.rootBounds?.height||innerHeight;
  const visible=entry.isIntersecting&&entry.intersectionRect.height>=Math.min(height*.5,available*.5)&&entry.intersectionRect.width>0;
  if(visible===inView)return;inView=visible;if(inView)enter();else leave();
 },{rootMargin:'-56px 0px 0px',threshold:Array.from({length:21},(_,i)=>i/20)});
 observer.observe(video);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)leave();else enter();});
 updateSound();
}

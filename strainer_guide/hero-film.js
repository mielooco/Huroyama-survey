import {content} from './content.js?v=hero-film1';

export function youtubeId(value) {
 try {
  const url = new URL(value), host = url.hostname.toLowerCase();
  const id = host === 'youtu.be' ? url.pathname.slice(1) : ['youtube.com','www.youtube.com','m.youtube.com'].includes(host) ? url.searchParams.get('v') : '';
  return /^[\w-]{11}$/.test(id || '') ? id : null;
 } catch { return null; }
}
let apiPromise;
function youtubeAPI() {
 if (window.YT?.Player) return Promise.resolve(window.YT);
 return apiPromise ??= new Promise((resolve,reject) => {
  const timeout = setTimeout(() => reject(Error('YouTube API timeout')),15000);
  const previous = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => { clearTimeout(timeout);previous?.();resolve(window.YT); };
  const script = document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;
  script.onerror=()=>{clearTimeout(timeout);reject(Error('YouTube API unavailable'));};document.head.append(script);
 });
}
export function initHeroFilm() {
 const host=document.querySelector('.hero-film'),button=host?.querySelector('.hero-film-start');
 if(!host||!button)return;
 const error=host.querySelector('.hero-film-error'),id=youtubeId(content.links.operation.url);
 const allowAuto=!matchMedia('(prefers-reduced-motion: reduce)').matches&&!navigator.connection?.saveData;
 let player,starting=false,ready=false,inView=false,held=false,resume=false,manual=false,offscreenPause=false,ended=false,readyTimeout;
 const fail=()=>{clearTimeout(readyTimeout);button.removeAttribute('aria-busy');error.hidden=false;button.hidden=true;};
 if(!id){fail();return;}
 // Match the actual full film's cover, retaining the local poster if unavailable.
 const poster=button.querySelector('img');poster.onerror=()=>{poster.onerror=null;poster.src=content.videos.install.poster;};poster.src=`https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
 const play=()=>{if(!ready)return;button.hidden=true;if(ended){player.seekTo(0,true);ended=false;}player.playVideo();};
 async function start(user=false) {
  manual ||= user;
  if(ready){play();return;}
  if(starting)return;starting=true;button.setAttribute('aria-busy','true');
  try {
   const YT=await youtubeAPI();
   const iframe=document.createElement('iframe');iframe.id='hero-film-player';iframe.title='浴山廚房快排濾網完整影片';
   const params=new URLSearchParams({enablejsapi:'1',playsinline:'1',rel:'0',mute:'1',origin:location.origin});
   iframe.src=`https://www.youtube-nocookie.com/embed/${id}?${params}`;
   iframe.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';iframe.allowFullscreen=true;iframe.referrerPolicy='strict-origin-when-cross-origin';
   host.querySelector('#hero-film-player').replaceWith(iframe);
   readyTimeout=setTimeout(fail,20000);
   player=new YT.Player(iframe,{events:{
    onReady:()=>{clearTimeout(readyTimeout);ready=true;error.hidden=true;button.hidden=false;button.removeAttribute('aria-busy');player.mute();resume=manual||allowAuto;if(inView&&!document.hidden&&resume){resume=false;play();}},
    onAutoplayBlocked:()=>{button.hidden=false;},
    onError:fail,
    onStateChange:({data})=>{
     if(data===YT.PlayerState.PLAYING){button.hidden=true;ended=false;offscreenPause=false;if(!inView||document.hidden){resume=true;offscreenPause=true;player.pauseVideo();}}
     if(data===YT.PlayerState.PAUSED){if(!offscreenPause)held=true;offscreenPause=false;}
     if(data===YT.PlayerState.ENDED){ended=true;held=true;resume=false;button.hidden=false;button.setAttribute('aria-label','重播完整影片');button.querySelector('.hero-film-play').textContent='↻';}
    }
   }});
  } catch {fail();}
 }
 const pause=()=>{if(ready&&player.getPlayerState()===1){resume=true;offscreenPause=true;player.pauseVideo();}};
 button.addEventListener('click',()=>{held=false;start(true);});
 new IntersectionObserver(entries=>{
  const r=entries[0].boundingClientRect;inView=entries[0].intersectionRect.height>=Math.min(r.height,innerHeight)*.5;
  if(!inView){pause();return;}
  if(!document.hidden&&!held){if(resume&&ready){resume=false;play();}else if(allowAuto&&!starting)start();}
 },{threshold:[0,.25,.5,.75,1]}).observe(host);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(inView&&resume&&!held){resume=false;play();}});
}

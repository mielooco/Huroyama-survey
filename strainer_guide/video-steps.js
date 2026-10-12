import {content} from './content.js?v=home-layout1';
import {escapeHTML as esc} from './content-render.js?v=home-layout1';
export const videoGuides=content.videos;
const soundIcon=(muted)=>`<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 4 6 8H3v8h3l5 4V4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>${muted?'<path d="m16 9 5 6m0-6-5 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>':'<path d="M15 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'}</svg>`;
export function videoSequence(kind){const c=videoGuides[kind];return `<section class="video-guide" data-video-guide="${kind}" aria-label="${esc(c.title)}分步影片"><div class="video-frame"><video playsinline muted preload="none" poster="${esc(c.poster)}" data-src="${esc(c.file)}" role="button" tabindex="0" aria-label="播放${esc(c.title)}影片" title="點影片播放或暫停"></video><button class="video-replay" data-video-replay aria-label="重播${esc(c.title)}影片" title="重播" hidden><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1.6 7M4 4v6h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="video-sound" data-video-sound aria-label="開啟影片聲音" aria-pressed="false">${soundIcon(true)}</button><span class="video-loading" role="status" hidden>正在載入影片…</span><div class="video-steps" role="group" aria-label="${esc(c.title)}影片步驟">${c.steps.map((s,i)=>`<button data-video-step="${i}" aria-pressed="${i===0}"><span>0${i+1}</span><strong>${esc(s.title)}</strong></button>`).join('')}</div></div><p class="video-step-copy" aria-live="polite">${esc(c.steps[0].text)}</p><p class="video-error" role="status" hidden>影片暫時無法播放，請重試；你仍可點選步驟閱讀說明。<button data-video-retry>重新載入</button></p></section>`;}
function showStep(host,index){const changed=host.dataset.activeStep!==String(index);host.dataset.activeStep=String(index);const c=videoGuides[host.dataset.videoGuide];host.querySelectorAll('[data-video-step]').forEach((b,i)=>b.setAttribute('aria-pressed',i===index));host.querySelector('.video-step-copy').textContent=c.steps[index].text;if(changed)host.dispatchEvent(new CustomEvent('video-step-change',{bubbles:true,detail:{kind:host.dataset.videoGuide,index}}));}
const mediaFiles=new Map(),prepared=new WeakMap(),stepControllers=new WeakMap();
export function selectVideoStep(host,index,{play=false}={}){return stepControllers.get(host)?.(index,play);}
async function prepareVideo(video){
 if(prepared.has(video))return prepared.get(video);
 const pending=(async()=>{const src=video.dataset.src;let file=mediaFiles.get(src);if(!file){file=fetch(src).then(r=>{if(!r.ok)throw Error('video download');return r.blob();}).then(blob=>URL.createObjectURL(new Blob([blob],{type:'video/mp4'}))).catch(e=>{mediaFiles.delete(src);throw e;});mediaFiles.set(src,file);}
 const url=await file;
 await new Promise((resolve,reject)=>{const done=()=>{cleanup();resolve();},fail=()=>{cleanup();reject(Error('video load'));},timer=setTimeout(fail,15000);const cleanup=()=>{clearTimeout(timer);video.removeEventListener('loadeddata',done);video.removeEventListener('error',fail);};video.addEventListener('loadeddata',done);video.addEventListener('error',fail);video.src=url;video.load();});
 })().catch(error=>{prepared.delete(video);throw error;});prepared.set(video,pending);return pending;
}
export function initVideoGuides(root=document){root.querySelectorAll('[data-video-guide]').forEach(host=>{
 if(host.dataset.bound)return;host.dataset.bound='true';
 const video=host.querySelector('video'),config=videoGuides[host.dataset.videoGuide],loading=host.querySelector('.video-loading'),error=host.querySelector('.video-error'),sound=host.querySelector('[data-video-sound]'),replay=host.querySelector('[data-video-replay]');
 video.muted=true;let request=0,inView=false,held=false;
 const hideReplay=()=>{if(document.activeElement===replay)video.focus({preventScroll:true});replay.hidden=true;};
 const label=()=>video.setAttribute('aria-label',`${video.paused?'播放':'暫停'}${config.title}影片`);
 async function operate(time,play,automatic=false){const token=++request;hideReplay();video.pause();error.hidden=true;loading.hidden=false;
 try{await prepareVideo(video);if(token!==request||!host.isConnected)return;if(time!==null)video.currentTime=Math.min(time,Math.max(0,video.duration-.05));if(play&&(!automatic||(inView&&!document.hidden)))await video.play();}
 catch(e){if(token===request&&e.name!=='NotAllowedError'&&e.name!=='AbortError')error.hidden=false;}
 finally{if(token===request){loading.hidden=true;label();}}
 }
 function toggle(){held=!video.paused;if(held){++request;loading.hidden=true;video.pause();}else operate(video.ended?0:null,true);label();}
 stepControllers.set(host,(index,play)=>{if(!config.steps[index])return;held=!play;showStep(host,index);return operate(play?config.steps[index].start:config.steps[index].at,play);});
 host.addEventListener('click',e=>{const step=e.target.closest('[data-video-step]');if(step){selectVideoStep(host,Number(step.dataset.videoStep),{play:true});return;}
 if(e.target.closest('[data-video-sound]')){video.muted=!video.muted;sound.innerHTML=soundIcon(video.muted);sound.setAttribute('aria-label',video.muted?'開啟影片聲音':'關閉影片聲音');sound.setAttribute('aria-pressed',!video.muted);return;}
 if(e.target.closest('[data-video-replay]')){held=false;showStep(host,0);operate(0,true);return;}
 if(e.target.closest('[data-video-retry]')){held=false;operate(0,true);return;}if(e.target===video)toggle();
 });
 video.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();toggle();}});
 video.addEventListener('timeupdate',()=>{if(video.paused)return;let i=0;config.steps.forEach((s,n)=>{if(video.currentTime>=s.start)i=n;});showStep(host,i);});
 video.addEventListener('play',()=>{hideReplay();label();document.querySelectorAll('.video-guide video').forEach(v=>{if(v!==video)v.pause();});});video.addEventListener('pause',label);video.addEventListener('ended',()=>{held=true;replay.hidden=false;label();});
 // Keep loading separate from playback intent: leaving during download must not consume autoplay.
 const leave=()=>{++request;loading.hidden=true;video.pause();};
 const enter=()=>{if(inView&&!held&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)operate(null,true,true);};
 const observer=new IntersectionObserver(entries=>{
  const entry=entries.at(-1),height=entry.boundingClientRect.height,available=entry.rootBounds?.height||innerHeight;
  const visible=entry.isIntersecting&&entry.intersectionRect.height>=Math.min(height*.5,available*.5)&&entry.intersectionRect.width>0;
  if(visible===inView)return;inView=visible;if(inView)enter();else leave();
 },{rootMargin:'-56px 0px 0px',threshold:Array.from({length:21},(_,i)=>i/20)});
 observer.observe(video);
 document.addEventListener('visibilitychange',()=>{if(!host.isConnected)return;if(document.hidden)leave();else enter();});
 });}

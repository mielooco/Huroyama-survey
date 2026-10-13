import {content} from './content.js?v=c1';
import {escapeHTML as esc,renderFAQ,renderPageContent,fullFilmMarkup} from './content-render.js?v=c1';
import {videoSequence,initVideoGuides,selectVideoStep} from './video-steps.js?v=c1';
import {careDetails,syncCare} from './care-content.js?v=c1';
import {chapters,routeFromHash} from './guide-logic.js?v=c1';
renderPageContent();
let waterModule;
const root=document.querySelector('#guide-content'),nav=document.querySelector('#guide-nav');
const state={chapter:routeFromHash(location.hash),use:'drain',care:'daily'};
function chapterHTML(chapter){
 const c=content.chapters.find(c=>c.id===chapter);
 let html=`<p class="panel-kicker">${esc(c.number)} / EVERYDAY GUIDE</p><h2 class="chapter-title" tabindex="-1">${esc(c.title)}</h2><p class="guide-lead">${esc(c.description)}</p>`;
 if(chapter==='install')html+=videoSequence('install');
 if(chapter==='use')html+=`<div id="water-demo-slot"><div class="demo-placeholder">${esc(content.dailyUse.placeholder)}</div></div>`;
 if(chapter==='empty')html+=videoSequence('empty');
 if(chapter==='care')html+=videoSequence('care')+`<div class="mode-switch" role="group" aria-label="清潔維護類型">${Object.entries(content.care.modes).map(([id,c])=>`<button data-care="${id}" aria-pressed="${state.care===id}">${esc(c.label)}</button>`).join('')}</div><div class="feature-copy care-copy" aria-live="polite">${careDetails(state.care)}</div><div class="faq" id="guide-faq" tabindex="-1"><h3>${esc(content.care.faqTitle)}</h3>${content.care.faq.map(renderFAQ).join('')}<nav class="faq-resources" aria-label="${esc(content.care.resourceTitle)}">${content.care.resourceLinks.map(key=>key==='operation'?`<button type="button" data-full-film>${esc(content.links[key].label)} <span aria-hidden="true">▷</span></button>`:`<a href="${esc(content.links[key].url)}" target="_blank" rel="noopener">${esc(content.links[key].label)} <span aria-hidden="true">↗</span></a>`).join('')}</nav></div>`;
 return html;
}

const sections=new Map();
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
nav.innerHTML=chapters.map(([id,title],i)=>`<a href="#guide-${id}" data-go="${id}"><span class="guide-number">0${i+1}</span><strong>${esc(title)}</strong></a>`).join('');
for(const [id,title] of chapters){
 const section=document.createElement('section');section.id=`guide-${id}`;section.className=`story-chapter chapter-${id}`;section.setAttribute('aria-labelledby',`heading-${id}`);
 const content=document.createElement('div');content.className='chapter-content';content.innerHTML=chapterHTML(id);
 const heading=content.querySelector('.chapter-title');heading.id=`heading-${id}`;
 section.append(content);root.append(section);sections.set(id,section);
}
initVideoGuides(root);
sections.get('fit').append(document.querySelector('#model-reference'));
document.querySelector('#model-reference').hidden=false;
function setActive(id){state.chapter=id;for(const a of nav.querySelectorAll('[data-go]')){if(a.dataset.go===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}}
function go(id,push=true){
 const section=sections.get(id);if(!section)return;
 if(push&&location.hash!==`#guide-${id}`)history.pushState(null,'',`#guide-${id}`);
 setActive(id);section.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});
 section.querySelector('.chapter-title').focus({preventScroll:true});
}
let waterReady=false,waterPending;
async function ensureWater(){
 if(waterReady)return;
 if(waterPending)return waterPending;
 const slot=document.querySelector('#water-demo-slot');
 waterPending=(async()=>{try{
  const m=await(waterModule??=import('./water-demo.js?v=c1'));slot.replaceChildren();m.mountWaterDemo(slot,state.use);waterReady=true;
 }catch(error){console.error(error);slot.innerHTML='<button class="primary-button" data-retry-water>重新載入互動示意</button>';}finally{waterPending=null;}})();
 return waterPending;
}
const lazy=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))ensureWater();},{rootMargin:'300px'});lazy.observe(document.querySelector('#water-demo-slot'));
document.addEventListener('click',async e=>{
 const b=e.target.closest('button,a[data-go]');if(!b)return;
 if(b.dataset.go){e.preventDefault();go(b.dataset.go);}
 if(b.dataset.use){state.use=b.dataset.use;await ensureWater();const m=await waterModule;m.mountWaterDemo(document.querySelector('#water-demo-slot'),state.use);document.querySelector(`[data-use="${state.use}"]`)?.focus({preventScroll:true});}
 if(b.dataset.care){state.care=b.dataset.care;syncCare(root,state.care);selectVideoStep(root.querySelector('[data-video-guide=care]'),state.care==='deep'?1:0);}
 if(b.hasAttribute('data-retry-water'))ensureWater();
 if(b.dataset.reference){go('fit');document.dispatchEvent(new CustomEvent('model-view',{detail:b.dataset.reference}));}
});
document.addEventListener('water-mode',e=>{if(['seal','drain'].includes(e.detail.mode)){state.use=e.detail.mode;}});
window.addEventListener('hashchange',()=>location.hash==='#guide-faq'?goFAQ(false):go(routeFromHash(location.hash),false));
let scrollQueued=false;
function trackSection(){scrollQueued=false;let id='install';for(const [key,section] of sections){if(section.getBoundingClientRect().top<=Math.min(innerHeight*.35,240))id=key;}setActive(id);}
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(trackSection);}},{passive:true});
setActive(state.chapter);
if(location.hash.startsWith('#guide-'))requestAnimationFrame(()=>location.hash==='#guide-faq'?goFAQ(false):go(routeFromHash(location.hash),false));

document.addEventListener('video-step-change',e=>{if(e.detail.kind==='care'){state.care=e.detail.index===0?'daily':'deep';syncCare(root,state.care);}});

function goFAQ(push=true){
 const faq=document.querySelector('#guide-faq');
 if(push&&location.hash!=='#guide-faq')history.pushState(null,'','#guide-faq');
 setActive('care');faq.scrollIntoView({behavior:'instant',block:'start'});faq.focus({preventScroll:true});
}
const filmDialog=document.createElement('dialog');filmDialog.className='full-film-dialog';filmDialog.setAttribute('aria-label','完整影片');
filmDialog.innerHTML='<div class="film-dialog-heading"><strong>完整影片</strong><button type="button" data-close-film aria-label="關閉完整影片">關閉 ×</button></div><div class="hero-film"></div>';
document.body.append(filmDialog);
let filmInitialized=false;
const closeFilm=()=>filmDialog.close();
filmDialog.querySelector('[data-close-film]').addEventListener('click',closeFilm);
filmDialog.addEventListener('click',e=>{if(e.target===filmDialog){const r=filmDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeFilm();}});
filmDialog.addEventListener('close',()=>filmDialog.querySelector('video')?.pause());
document.addEventListener('click',async e=>{
 if(e.target.closest('[data-faq-jump]')){e.preventDefault();goFAQ();}
 if(e.target.closest('[data-full-film]')){
  filmDialog.showModal();
  if(!filmInitialized){filmInitialized=true;filmDialog.querySelector('.hero-film').innerHTML=fullFilmMarkup();const {initHeroFilm}=await import('./hero-film.js?v=c1');initHeroFilm();}
 }
});

import {videoSequence,initVideoGuides,selectVideoStep} from './video-steps.js?v=video-replay7';
import {biofilmFAQ,careDetails,syncCare} from './care-content.js?v=video-replay7';
import {chapters,routeFromHash} from './guide-logic.js?v=spec2';
let waterModule;
const root=document.querySelector('#guide-content'),nav=document.querySelector('#guide-nav');
const state={chapter:routeFromHash(location.hash),install:0,empty:0,use:'drain',care:'daily'};
const button=(chapter,label)=>`<button class="primary-button" data-go="${chapter}">${label}<span aria-hidden="true">→</span></button>`;
const model=(tab,label)=>`<button class="text-button" data-reference="${tab}">${label} ↗</button>`;
const source=(label,url)=>`<a class="source-link" href="${url}" target="_blank" rel="noopener">${label} ↗</a>`;
const intro=(n,title,description)=>`<p class="panel-kicker">${n} / EVERYDAY GUIDE</p><h2 class="chapter-title" tabindex="-1">${title}</h2><p class="guide-lead">${description}</p>`;
const steps={
 install:[['取出原有濾籃','先拿出水槽原本可提起的濾籃，保留原有排水座。','要更換的是濾籃位置；不需要為了這個步驟拆掉水槽下方的排水管。'],['放入浴山快排濾網','將組合好的產品對準原排水座放入，確認適配環就位、杯體坐穩。','若無法平穩放入，先取出重新核對尺寸與排水座形狀，不要強壓。'],['確認就位與排水','確認上方沒有明顯歪斜，以少量水檢查排水，再試用按壓止水功能。','若排水異常或無法止水，可到清潔維護查看檢查項目。']],
 empty:[['準備清倒','停止進水，確認水槽沒有蓄水，再處理渣籃中的廚餘。','先辨認上蓋、渣籃與中央提取位置，避免把整組杯體一起帶起。'],['用專用提把取出渣籃','依操作影片將提把接合渣籃的提取位置，確認穩固後提起。','這裡的提把用來減少手部直接接觸廚餘。接合方向請對照影片示範。'],['倒渣並沖洗','把菜渣倒入廚餘桶，再沖洗渣籃內壁、底部與孔洞。','先把廚餘清倒出去，再清洗殘留，保持排水孔洞暢通。'],['放回並確認','將渣籃與取下的上蓋復位，確認放置平穩、中央部位沒有被殘渣卡住。','清倒完成後，即可回到日常排水使用。']]
};
function sequence(kind){return videoSequence(kind);}
function chapterHTML(chapter){let html="";
if(chapter==='fit')html=intro('01','規格說明','從尺寸到零件，先認識你的廚房濾網。');
if(chapter==='install')html=intro('02','取出舊濾籃。放入新日常。','適用尺寸確認後，依序了解安裝位置與使用前檢查。')+sequence('install')+`<div class="guide-bottom installation-links">${model('installation','對照水槽安裝模型')}${source('確認適用尺寸','https://survey.mieloo-corp.com/fit-check/#type')}</div>`;
if(chapter==='use')html=intro('03','一按之間，切換日常。','依你當下的需求，查看產品的兩種使用狀態。')+`<div id="water-demo-slot"><div class="demo-placeholder">滑到這裡，探索蓄水、排水與止臭。</div></div>`;
if(chapter==='empty')html=intro('04','用提把完成取渣與清倒。','專用提把協助提取渣籃，減少雙手直接接觸廚餘。')+sequence('empty');
if(chapter==='care'){const kind=state.care;html=intro('05','每次洗淨，為下次準備。','日常沖洗渣籃，需要時再進行深度浸泡清潔。')+sequence('care')+`<div class="mode-switch" role="group" aria-label="清潔維護類型">${[['daily','日常清洗'],['deep','深度清潔']].map(([id,label])=>`<button data-care="${id}" aria-pressed="${kind===id}">${label}</button>`).join('')}</div><div class="feature-copy care-copy" aria-live="polite">${careDetails(kind)}</div><div class="faq"><h3>遇到這些情況，可以先看這裡</h3>${biofilmFAQ}<details><summary>排水變慢</summary><p>先清倒渣籃，檢查底部、側邊孔洞及杯體內是否有殘渣，再確認止水閥是否處於排水狀態。若清理後仍無改善，需進一步檢查原有排水系統。</p></details><details><summary>無法止水，或按壓卡住</summary><p>查看中央止水部位是否夾有異物、部件是否正確就位。若仍無法正常止水、動作卡滯，或零件有明顯破損，請向米鹿設計團隊詢問對應零件與處理方式。目前沒有已確認的固定更換週期。</p></details><details><summary>有異味、污垢或疑似霉斑</summary><p>清潔時一起查看上蓋背面、渣籃內外、杯體內側及適配環接觸處，避免只沖洗看得到的菜渣。這些是清潔檢查位置，目前沒有資料證實特定部件必然容易發霉。持續異味也可能需要檢查原有排水系統。</p></details><details><summary>哪些是定期更換的耗材？</summary><p>目前產品資料說明零件可維護與替換，但沒有列出固定耗材週期。請依零件狀況及官方建議處理，不需要自行假設每幾個月整組更換。</p></details></div>`;}
return html;}

const sections=new Map();
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
nav.innerHTML=chapters.map(([id,title],i)=>`<a href="#guide-${id}" data-go="${id}"><span class="guide-number">0${i+1}</span><strong>${title}</strong></a>`).join('');
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
function refresh(id){
 const host=sections.get(id).querySelector('.chapter-content');const active=document.activeElement;
 const focus=active?.dataset.step!==undefined?`[data-kind="${active.dataset.kind}"][data-step="${active.dataset.step}"]`:active?.dataset.care?`[data-care="${active.dataset.care}"]`:null;
 host.innerHTML=chapterHTML(id);initVideoGuides(host);host.querySelector('.chapter-title').id=`heading-${id}`;
 if(focus)host.querySelector(focus)?.focus({preventScroll:true});
}
let waterReady=false,waterPending;
async function ensureWater(){
 if(waterReady)return;
 if(waterPending)return waterPending;
 const slot=document.querySelector('#water-demo-slot');
 waterPending=(async()=>{try{
  const m=await(waterModule??=import('./water-demo.js?v=video-replay7'));slot.replaceChildren();m.mountWaterDemo(slot,state.use);waterReady=true;
 }catch(error){console.error(error);slot.innerHTML='<button class="primary-button" data-retry-water>重新載入互動示意</button>';}finally{waterPending=null;}})();
 return waterPending;
}
const lazy=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))ensureWater();},{rootMargin:'300px'});lazy.observe(document.querySelector('#water-demo-slot'));
document.addEventListener('click',async e=>{
 const b=e.target.closest('button,a[data-go]');if(!b)return;
 if(b.dataset.go){e.preventDefault();go(b.dataset.go);}
 if(b.dataset.step!==undefined){const kind=b.dataset.kind,n=Number(b.dataset.step);if(steps[kind]&&n>=0&&n<steps[kind].length){state[kind]=n;refresh(kind==='install'?'install':'empty');}}
 if(b.dataset.use){state.use=b.dataset.use;await ensureWater();const m=await waterModule;m.mountWaterDemo(document.querySelector('#water-demo-slot'),state.use);document.querySelector(`[data-use="${state.use}"]`)?.focus({preventScroll:true});}
 if(b.dataset.care){state.care=b.dataset.care;syncCare(root,state.care);selectVideoStep(root.querySelector('[data-video-guide=care]'),state.care==='deep'?1:0);}
 if(b.hasAttribute('data-retry-water'))ensureWater();
 if(b.dataset.reference){go('fit');document.dispatchEvent(new CustomEvent('model-view',{detail:b.dataset.reference}));}
});
document.addEventListener('water-mode',e=>{if(['seal','drain'].includes(e.detail.mode)){state.use=e.detail.mode;}});
window.addEventListener('hashchange',()=>go(routeFromHash(location.hash),false));
let scrollQueued=false;
function trackSection(){scrollQueued=false;let id='fit';for(const [key,section] of sections){if(section.getBoundingClientRect().top<=Math.min(innerHeight*.35,240))id=key;}setActive(id);}
addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(trackSection);}},{passive:true});
setActive(state.chapter);
if(location.hash.startsWith('#guide-'))requestAnimationFrame(()=>go(routeFromHash(location.hash),false));

document.addEventListener('video-step-change',e=>{if(e.detail.kind==='care'){state.care=e.detail.index===0?'daily':'deep';syncCare(root,state.care);}});

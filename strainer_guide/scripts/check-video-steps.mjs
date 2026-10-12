import assert from 'node:assert/strict';
import {initVideoGuides,selectVideoStep,videoGuides} from '../video-steps.js';
class Element extends EventTarget {
 dataset={};hidden=false;attributes={};
 setAttribute(k,v){this.attributes[k]=String(v);}
 focus(){}
}
class Video extends Element {
 paused=true;currentTime=0;duration=30;ended=false;
 load(){queueMicrotask(()=>this.dispatchEvent(new Event('loadeddata')));}
 async play(){this.paused=false;this.ended=false;this.dispatchEvent(new Event('play'));}
 pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
}
const observers=[],videos=[];
globalThis.document=new Element();document.hidden=false;document.querySelectorAll=()=>videos;
globalThis.matchMedia=()=>({matches:false});globalThis.innerHeight=600;
globalThis.fetch=async()=>({ok:true,blob:async()=>new Blob(['video'])});
globalThis.IntersectionObserver=class {constructor(fn){this.fn=fn;observers.push(this);}observe(){} };
const settle=()=>new Promise(r=>setImmediate(r));
function setup(kind){
 const video=new Video();video.dataset.src=videoGuides[kind].file;videos.push(video);
 const host=new Element();host.dataset.videoGuide=kind;host.isConnected=true;
 const elements=Object.fromEntries(['.video-loading','.video-error','[data-video-sound]','[data-video-replay]','.video-step-copy'].map(k=>[k,new Element()]));elements.video=video;
 const buttons=videoGuides[kind].steps.map(()=>new Element());
 host.querySelector=q=>elements[q];host.querySelectorAll=()=>buttons;
 initVideoGuides({querySelectorAll:()=>[host]});
 const click=target=>{const event=new Event('click');Object.defineProperty(event,'target',{value:target});host.dispatchEvent(event);};
 const step=i=>click({dataset:{videoStep:String(i)},closest:s=>s==='[data-video-step]'?{dataset:{videoStep:String(i)}}:null});
 video.closest=()=>null;
 const visibility=visible=>observers.at(-1).fn([{isIntersecting:visible,boundingClientRect:{height:400},rootBounds:{height:600},intersectionRect:{height:visible?300:0,width:500}}]);
 return {video,host,elements,buttons,click,step,visibility};
}
for(const kind of ['install','empty','care']){
 const c=setup(kind);c.visibility(true);await settle();
 for(let i=0;i<3;i++){
  c.step(i);await settle();assert.equal(c.video.paused,false,`${kind}/${i}: step should play`);
  assert.equal(c.video.currentTime,videoGuides[kind].steps[i].start);
  assert.equal(c.host.dataset.activeStep,String(i));assert.equal(c.elements['[data-video-replay]'].hidden,true);
 }
 c.video.currentTime=videoGuides[kind].steps[1].start;c.video.dispatchEvent(new Event('timeupdate'));
 assert.equal(c.host.dataset.activeStep,'1','playback advances the selected step');
 c.video.paused=true;c.video.ended=true;c.video.dispatchEvent(new Event('ended'));
 assert.equal(c.elements['[data-video-replay]'].hidden,false,'show replay on completion');
 c.step(1);await settle();assert.equal(c.video.paused,false,'step click replays after completion');assert.equal(c.elements['[data-video-replay]'].hidden,true);
 c.visibility(false);assert.equal(c.video.paused,true);c.visibility(true);await settle();assert.equal(c.video.paused,false,'step playback resumes on return');
 c.click(c.video);assert.equal(c.video.paused,true);c.visibility(false);c.visibility(true);await settle();assert.equal(c.video.paused,true,'explicit pause stays paused');
 // Keep non-video care category buttons as static previews.
 await selectVideoStep(c.host,1);assert.equal(c.video.currentTime,videoGuides[kind].steps[1].at);assert.equal(c.video.paused,true);
 c.step(0);c.step(2);await settle();assert.equal(c.video.currentTime,videoGuides[kind].steps[2].start,'latest click wins');assert.equal(c.video.paused,false);
}
console.log('PASS: 9 step buttons play from start; continuous selection, replay, rapid clicks, scroll and manual pause');

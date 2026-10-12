import {CleanSparkle} from './clean-sparkle.js';
import {guardViewerWheel} from './mobile-viewer.js?v=basket-collection3';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {advanceWater,waterHeight,boundaryAt,hasOutflow} from './water-logic.js?v=fill3';
import {pressIsVisible} from './press-visibility.js';
import {BasketMotion} from './basket-motion.js';
import {SoakBubbles} from './soak-bubbles.js';
import {CleaningDemo} from './cleaning-demo.js?v=4';
import {OdorEffect} from './odor-effect.js?v=intake2';
let instance;
export function mountWaterDemo(parent,mode){if(!parent.isConnected)return;instance??=new WaterDemo();parent.append(instance.el);if(instance.topic==='filter')instance.setTopic('water');instance.setMode(mode);instance.resize();instance.wake();}
export async function showCollectionDemo(){if(!instance)return;await instance.loadPromise;instance.setTopic('filter');await instance.showDetails(true);}
class WaterDemo{
 constructor(){
  this.el=document.createElement('section');this.el.className='water-demo';this.el.setAttribute('aria-label','水槽蓄水與排水互動示意');
  this.el.innerHTML=`<div class="demo-views" role="group" aria-label="選擇觀看範圍"><button data-water="view-sink" aria-pressed="true">整組水槽</button><button data-water="details" aria-pressed="false">觀看內部細節</button></div><div class="demo-topics" role="group" aria-label="選擇功能示意"><span class="demo-topics-label">功能示意</span><button data-water="topic-water" aria-pressed="true">蓄水與排水</button><button data-water="topic-filter" aria-pressed="false">快排集渣</button><button data-water="topic-odor" aria-pressed="false">止臭示意</button><button data-water="topic-clean" aria-pressed="false">水槽清潔</button></div><div class="cleaning-options" hidden><div class="cleaner-choices" role="group" aria-label="選擇一種清潔方式"><button data-water="clean-citric" aria-pressed="true">白色水垢 · 檸檬酸</button><button data-water="clean-oxygen" aria-pressed="false">污漬 · 過碳酸鈉</button></div></div><div class="water-stage"><p class="cleaning-warning" hidden><strong><svg class="warning-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10.3 4.1 2.7 17.3A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.7L13.7 4.1a2 2 0 0 0-3.4 0Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16.3" r="1" fill="currentColor"/></svg>請擇一使用</strong>檸檬酸與過碳酸鈉不可同時使用，混合會發生酸鹼中和，影響清潔效果。檸檬酸也不可與含氯漂白水混用。</p><button class="warning-reopen" data-water="warning" hidden>⚠ 使用提醒</button><div class="water-controls" role="group" aria-label="示意操作"><button data-water="seal" aria-pressed="false">止水蓄水</button><button data-water="clean-start" hidden>加入清潔劑</button><button data-water="drain" aria-pressed="true">解除止水</button><button data-water="inlet" aria-pressed="true">關閉進水</button><button data-water="pause" aria-pressed="false">暫停</button><button data-water="replay">重播蓄水</button></div><div class="water-heading"><span class="water-tag">LIVE DEMO</span><strong>整組水槽 · 蓄排水示意</strong></div><div class="cleaning-clock" role="timer" aria-label="浸泡時間加速示意" aria-live="off" hidden><small>浸泡時間 · 加速示意</small><div><strong>0</strong><span> / 20 分鐘</span></div></div><div class="water-canvas" aria-label="可縮放、上下轉動的水槽蓄排水模型"></div><div class="water-loading" role="status">正在準備水槽模型…</div><button class="water-press" data-water="toggle"><span>按一下，止水蓄水</span><svg viewBox="0 0 32 48" aria-hidden="true"><path d="M16 3v32M5 25l11 13 11-13"/></svg></button><span class="odor-label" hidden>管內異味 ↑</span><div class="water-zoom-actions" role="group" aria-label="縮放與重設"><button data-water="zoom-in" aria-label="放大模型">＋</button><button data-water="zoom-out" aria-label="縮小模型">－</button><button data-water="reset">重設</button></div><div class="water-view-actions" role="group" aria-label="示意視角"><button data-water="front" aria-pressed="true">正面看蓄水</button><button data-water="below" aria-pressed="false">下方看排水</button></div><div class="water-hint">上下拖曳調整角度 · 雙指縮放</div></div><div class="water-dashboard"><div class="water-status"><span class="water-status-dot"></span><strong role="status" aria-live="polite"></strong></div><div class="water-meter" role="progressbar" aria-label="示意蓄水程度" aria-valuemin="0" aria-valuemax="100"><i></i></div><p class="water-explanation"></p><p class="cleaning-together" hidden>若有需要一起清潔的碗盤、餐具，可依髒污類型，確認材質與清潔劑適用後，放入水槽一同浸泡清洗，最後以清水充分沖淨。</p><p class="cleaning-reference" hidden>成分認識（中文維基百科）：<a href="https://zh.wikipedia.org/zh-tw/檸檬酸" target="_blank" rel="noopener">檸檬酸 ↗</a> · <a href="https://zh.wikipedia.org/zh-tw/過碳酸鈉" target="_blank" rel="noopener">過碳酸鈉 ↗</a></p><div class="water-care-note"><h3>洗完後，記得清倒</h3><p>快排結構仍需要保持清潔。用完後清倒菜渣並沖洗孔洞，避免殘留累積。</p></div><p class="water-footnote">濾籃上下行程約 1.5 cm；水位與流速為操作示意，不代表實際蓄水容量或排水效能。</p></div>`;
  this.topic='water';this.viewport=this.el.querySelector('.water-canvas');this.level=.035;this.mode='drain';this.inflow=true;this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;this.time=0;this.ready=false;this.lastStatus='';this.view='front';this.raf=0;
  this.el.addEventListener('click',e=>{const action=e.target.closest('[data-water]')?.dataset.water;if(!action)return;
   if(action==='details'){if(this.topic==='clean')this.setTopic('water');this.showDetails(true);}
   if(action==='view-sink'){if(this.topic==='filter')this.setTopic('water');this.showDetails(false);}
   if(action==='warning')this.showWarning();
   if(action.startsWith('topic-'))this.setTopic(action.slice(6));
   if(action==='clean-citric'||action==='clean-oxygen'){this.showWarning();this.cleaning?.select(action==='clean-citric'?'citric':'oxygen');this.level=0;this.mode='drain';this.inflow=false;this.paused=false;}
   if(action==='clean-start'&&this.topic==='clean'&&this.mode==='seal'&&this.level>=.95&&!['soaking','ready','rinsing','done'].includes(this.cleaning.phase)){this.inflow=false;this.paused=false;this.cleaning.start();}
   if(action==='seal'||action==='drain')this.requestMode(action);
   if(action==='toggle')this.requestMode(this.mode==='seal'?'drain':'seal');
   if(action==='inlet'){this.inflow=!this.inflow;this.paused=false;}
   if(action==='pause')this.paused=!this.paused;
   if(action==='replay'&&this.topic==='filter'){this.detail?.collection?.reset();this.paused=false;}
   if(action==='replay'&&this.topic!=='filter'){this.level=0;this.paused=false;if(this.topic==='clean'){this.cleaning.reset();this.mode='drain';this.inflow=false;}else{this.inflow=true;this.requestMode('seal');}}
   if(action==='front'||action==='below'){this.view=action;this.frameCamera();}
   if(action==='reset')this.frameCamera();
   if(action==='zoom-in'||action==='zoom-out')this.zoomCamera(action==='zoom-in'?.8:1.25);
   this.updateUI();this.wake();
  });
  this.onScreen=true;this.visibilityObserver=new IntersectionObserver(entries=>{this.onScreen=entries[0].isIntersecting;if(this.onScreen)this.wake();});this.visibilityObserver.observe(this.el);
  this.loadPromise=this.load();
 }
 showWarning(){clearTimeout(this.warningTimer);this.warningVisible=true;const el=this.el.querySelector('.cleaning-warning');el.hidden=false;el.style.animation='none';void el.offsetWidth;el.style.animation='';this.warningTimer=setTimeout(()=>{this.warningVisible=false;el.hidden=true;},3000);}
 requestMode(mode){this.setMode(mode);document.dispatchEvent(new CustomEvent('water-mode',{detail:{mode}}));}
 setMode(mode){if(mode!==this.mode){if(this.topic==='clean'&&mode==='drain')this.cleaning?.drain();if(this.topic==='clean'&&mode==='seal'&&['rinsing','done'].includes(this.cleaning?.phase)){this.cleaning.phase='interrupted';this.cleaning.rinse=0;}this.mode=mode;this.inflow=this.topic!=='odor'&&mode==='seal';this.paused=false;this.pulse=1;}this.updateUI();}
 setTopic(topic){if(topic===this.topic)return;this.topic=topic;this.level=0;this.inflow=topic==='water'||topic==='filter';this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;this.odor?.reset(this.mode==='seal');if(topic==='filter'){this.mode='drain';if(this.detail?.ready)this.detail.setCover(false);this.showDetails(true);this.detail?.collection?.reset();}if(topic!=='clean'){this.warningVisible=false;clearTimeout(this.warningTimer);}if(topic==='clean'){this.showWarning();this.paused=false;this.showDetails(false);this.cleaning?.reset();this.mode='drain';this.view='front';this.frameCamera();}this.updateUI();}
 async ensureDetail(){
  if(this.detail)return this.detail;
  // Share the same in-flight import/creation across repeated entry clicks.
  this.detailPending??=(async()=>{
   const {DetailView}=await import('./detail-view.js?v=basket-collection3');
   const host=document.createElement('div');host.className='detail-host';host.hidden=true;
   this.el.querySelector('.water-stage').append(host);
   try{const view=new DetailView(host,this.model,this.basketMotion.base);this.detailHost=host;this.detail=view;return view;}
   catch(error){host.remove();throw error;}
  })();
  try{return await this.detailPending;}catch(error){this.detailPending=null;throw error;}
 }
 async showDetails(open){
  if(!this.ready)return;
  const request=this.detailRequest=(this.detailRequest||0)+1;
  if(open){try{await this.ensureDetail();}catch(error){console.error(error);return;}}
  if(request!==this.detailRequest)return;
  this.detailOpen=open;const stage=this.el.querySelector('.water-stage');stage.classList.toggle('detail-open',open);
  for(const child of stage.children){if(child.classList.contains('detail-host')){child.hidden=!open||child!==this.detailHost;child.inert=!open||child!==this.detailHost;}else child.inert=open&&!child.classList.contains('water-controls');}
  const detailsButton=this.el.querySelector('[data-water=details]'),sinkButton=this.el.querySelector('[data-water=view-sink]');detailsButton.setAttribute('aria-pressed',String(open));sinkButton.setAttribute('aria-pressed',String(!open));if(open)this.detail.resize();(open?detailsButton:sinkButton).focus({preventScroll:true});this.updateUI();this.wake();
 }

 async load(){
  try{
   this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'default'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;this.viewport.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','水槽與浴山濾網。上下拖曳調整角度，雙指縮放；鍵盤上下鍵調整角度，加減鍵縮放。');
   this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(36,1,.01,10);
   const canvas=this.renderer.domElement;canvas.tabIndex=0;
   guardViewerWheel(canvas);this.controls=new OrbitControls(this.camera,canvas);this.controls.enablePan=false;this.controls.enableDamping=false;this.controls.minAzimuthAngle=0;this.controls.maxAzimuthAngle=0;this.controls.minPolarAngle=.25;this.controls.maxPolarAngle=1.85;this.controls.minDistance=.4;this.controls.maxDistance=4;this.controls.rotateSpeed=.55;this.controls.zoomSpeed=.75;this.controls.touches.TWO=THREE.TOUCH.DOLLY_ROTATE;
   this.controls.addEventListener('start',()=>this.markCustomView());
   canvas.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const offset=this.camera.position.clone().sub(this.controls.target),spherical=new THREE.Spherical().setFromVector3(offset);spherical.phi=THREE.MathUtils.clamp(spherical.phi+(e.key==='ArrowUp'?-.08:.08),this.controls.minPolarAngle,this.controls.maxPolarAngle);this.camera.position.copy(this.controls.target).add(new THREE.Vector3().setFromSpherical(spherical));this.controls.update();this.markCustomView();}else if(['+','=','-'].includes(e.key)){e.preventDefault();this.zoomCamera(e.key==='-'?1.25:.8);}});
   const pm=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.env=pm.fromScene(room,.04);this.scene.environment=this.env.texture;room.dispose();pm.dispose();this.scene.add(new THREE.HemisphereLight(0xffffff,0x92a6b7,2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(.3,1,.5);this.scene.add(light);
   this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.viewport);
   const [gltf,profile]=await Promise.all([new GLTFLoader().loadAsync('./assets/sink.glb?v=installed9mm'),fetch('./assets/water-profile.json').then(r=>{if(!r.ok)throw Error('water profile');return r.json();})]);
   this.model=gltf.scene;this.profile=profile;this.scene.add(this.model);this.model.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.envMapIntensity=1.1;}});this.model.updateMatrixWorld(true);const outletBox=new THREE.Box3().setFromObject(this.model.getObjectByName('drain_housing'));this.outlet=outletBox.getCenter(new THREE.Vector3());this.outlet.y=outletBox.min.y;
   this.cleaning=new CleaningDemo(this.model);this.cleanSparkle=new CleanSparkle(this.scene,this.model);this.basketMotion=new BasketMotion(this.model);this.makeWater();this.makeFlow();this.soakBubbles=new SoakBubbles(this.scene,this.profile);this.odor=new OdorEffect(this.scene,this.outlet);this.odor.reset(this.mode==='seal');this.frameCamera();this.ready=true;this.el.querySelector('.water-loading').hidden=true;this.resize();this.wake();
   const pointers=new Set();let down=null,moved=false;
   canvas.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);if(pointers.size===1){down=[e.clientX,e.clientY];moved=false;}else moved=true;});
   canvas.addEventListener('pointermove',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)moved=true;});
   canvas.addEventListener('pointercancel',e=>{pointers.delete(e.pointerId);down=null;moved=true;});
   canvas.addEventListener('pointerup',e=>{pointers.delete(e.pointerId);const click=down&&!moved&&e.button===0&&pointers.size===0;down=null;if(!click)return;const r=canvas.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),this.camera);if(this.pressHighlight.visible&&ray.intersectObject(this.pressHighlight).length)this.requestMode(this.mode==='seal'?'drain':'seal');});
   this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.ready=false;this.el.querySelector('.water-loading').hidden=false;this.el.querySelector('.water-loading').textContent='3D 顯示暫停，請重新整理頁面。';});
  }catch(e){console.error(e);this.ready=false;const loading=this.el.querySelector('.water-loading');loading.hidden=false;loading.textContent='水槽示意載入失敗，請重新整理重試。下方文字說明仍可閱讀。';}
 }
 makeWater(){
  const n=this.profile.count,rings=18,positions=[0,0,0],indices=[];this.rings=rings;
  for(let k=1;k<=rings;k++)for(let i=0;i<n;i++)positions.push(0,0,0);
  for(let i=0;i<n;i++)indices.push(0,1+(i+1)%n,1+i);
  for(let k=1;k<rings;k++)for(let i=0;i<n;i++){let a=1+(k-1)*n+i,b=1+(k-1)*n+(i+1)%n,c=a+n,d=b+n;indices.push(a,b,c,b,d,c);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);const normals=new Float32Array(positions.length);for(let i=1;i<normals.length;i+=3)normals[i]=1;geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
  const material=new THREE.MeshPhysicalMaterial({color:0x63bad8,metalness:0,roughness:.19,transparent:true,opacity:.62,depthWrite:false,side:THREE.DoubleSide,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1.2});
  this.waterUniform={value:0};material.onBeforeCompile=shader=>{shader.uniforms.waterTime=this.waterUniform;shader.vertexShader='varying vec3 waterPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nwaterPosition = position;');shader.fragmentShader='uniform float waterTime; varying vec3 waterPosition;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
 float wx=waterPosition.x, wz=waterPosition.z;
 float a=sin(wx*100.0+wz*60.0+waterTime*2.0);
 float b=cos(wz*85.0-wx*45.0-waterTime*1.7);
 normal=normalize(normal+vec3(a*.10,b*.10,0.0));`);};
  this.water=new THREE.Mesh(geometry,material);this.water.frustumCulled=false;this.scene.add(this.water);
 }
 makeFlow(){
  this.stream=new THREE.Mesh(new THREE.CylinderGeometry(.009,.012,1,20,1,true),new THREE.MeshBasicMaterial({color:0x3ab4e9,transparent:true,opacity:.48,depthWrite:false}));this.stream.material.onBeforeCompile=shader=>{shader.uniforms.waterTime=this.waterUniform;shader.vertexShader='varying float streamY;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nstreamY=position.y;');shader.fragmentShader='uniform float waterTime; varying float streamY;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb += vec3(pow(.5+.5*sin(streamY*125.0+waterTime*24.0),8.0)*.2);');};this.scene.add(this.stream);
  const dropGeometry=new THREE.SphereGeometry(.004,8,6),dropMaterial=new THREE.MeshBasicMaterial({color:0x65d2ff,transparent:true,opacity:.85});
  this.inletDrops=new THREE.InstancedMesh(dropGeometry,dropMaterial,28);this.inletDrops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.inletDrops.frustumCulled=false;this.scene.add(this.inletDrops);
  this.outletDrops=new THREE.InstancedMesh(dropGeometry,dropMaterial.clone(),24);this.outletDrops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.outletDrops.frustumCulled=false;this.scene.add(this.outletDrops);
  this.splash=new THREE.InstancedMesh(dropGeometry,new THREE.MeshBasicMaterial({color:0x5ccbf5,transparent:true,opacity:.7}),12);this.splash.instanceMatrix.setUsage(THREE.DynamicDrawUsage);this.splash.frustumCulled=false;this.scene.add(this.splash);
  this.cleaningDose=new THREE.InstancedMesh(new THREE.SphereGeometry(.002,6,4),new THREE.MeshBasicMaterial({color:0xfaf5da,transparent:true,opacity:.9} ),40);this.cleaningDose.frustumCulled=false;this.cleaningDose.visible=false;this.scene.add(this.cleaningDose);
  this.flowDummy=new THREE.Object3D();
  this.outflow=new THREE.Mesh(new THREE.CylinderGeometry(.014,.008,1,20,1,true),new THREE.MeshBasicMaterial({color:0x32aee8,transparent:true,opacity:.5,depthWrite:false}));this.scene.add(this.outflow);
  this.ripples=[];for(let i=0;i<4;i++){const ring=new THREE.Mesh(new THREE.RingGeometry(.94,1,80),new THREE.MeshBasicMaterial({color:0xd2f5ff,transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;this.scene.add(ring);this.ripples.push(ring);}
  this.lines=[];for(let i=0;i<10;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(12*3),3));const line=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xe0faff,transparent:true,opacity:.65,depthWrite:false}));line.frustumCulled=false;this.scene.add(line);this.lines.push(line);}
  this.pressHighlight=new THREE.Mesh(new THREE.CircleGeometry(.017,64),new THREE.MeshBasicMaterial({color:0xef493e,transparent:true,opacity:.25,side:THREE.DoubleSide,depthWrite:false,depthTest:true}));this.pressHighlight.rotation.x=-Math.PI/2;this.pressHighlight.position.set(0,-.200,-.055);this.pressHighlight.renderOrder=10;this.scene.add(this.pressHighlight);
 }
 markCustomView(){this.customView=true;this.el.querySelectorAll('[data-water=front],[data-water=below]').forEach(b=>b.setAttribute('aria-pressed','false'));}
 zoomCamera(factor){if(!this.controls)return;const offset=this.camera.position.clone().sub(this.controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,this.controls.minDistance,this.controls.maxDistance));this.camera.position.copy(this.controls.target).add(offset);this.controls.update();this.markCustomView();}
 frameCamera(){
  if(!this.camera)return;
  // Keep azimuth at the front in both views; frame source, basin and outlet together.
  const target=new THREE.Vector3(0,-.20,0),dir=new THREE.Vector3(0,this.view==='front'?1.1:-.10,1).normalize();
  const right=new THREE.Vector3(1,0,0),up=new THREE.Vector3().crossVectors(dir,right).normalize(),tan=Math.tan(THREE.MathUtils.degToRad(this.camera.fov/2));let distance=0;
  const framePoints=[new THREE.Vector3(0,.23,-.12),new THREE.Vector3(0,-.63,-.055)];
  if(this.model)this.model.traverse(o=>{if(o.isMesh){const box=new THREE.Box3().setFromObject(o);for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])framePoints.push(new THREE.Vector3(x,y,z));}});
  const projectedHeights=framePoints.map(point=>point.clone().sub(target).dot(up));target.addScaledVector(up,(Math.min(...projectedHeights)+Math.max(...projectedHeights))/2);
  for(const point of framePoints){const offset=point.clone().sub(target);distance=Math.max(distance,Math.abs(offset.dot(right))/(tan*this.camera.aspect)+offset.dot(dir),Math.abs(offset.dot(up))/tan+offset.dot(dir));}
  this.camera.position.copy(target).addScaledVector(dir,distance*1.08);this.camera.lookAt(target);this.controls.target.copy(target);this.controls.update();this.camera.updateMatrixWorld();this.customView=false;
  this.el.querySelectorAll('[data-water=front],[data-water=below]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.water===this.view));
 }
 placeLabel(selector,point,visible=true){const el=this.el.querySelector(selector);const p=point.clone().project(this.camera),w=this.viewport.clientWidth,h=this.viewport.clientHeight;let x=(p.x+1)*w/2,y=(1-p.y)*h/2;el.hidden=!visible||p.z>1||p.z< -1||x<0||x>w||y<0||y>h;
  if(selector==='.odor-label'&&!el.hidden){
   // Keep the full label inside the stage and clear of the operation toolbar,
   // even after camera zoom, orbit, or mobile button wrapping.
   const gap=14,labelWidth=el.offsetWidth,labelHeight=el.offsetHeight;
   const toolbar=this.el.querySelector('.water-controls');
   const ceiling=toolbar.offsetTop-gap-labelHeight/2;
   x=Math.max(gap,Math.min(x,w-labelWidth-gap));
   y=Math.max(gap+labelHeight/2,Math.min(y,ceiling));
  }
  el.style.left=`${x}px`;el.style.top=`${y}px`;}
 resize(){if(!this.renderer||!this.el.isConnected)return;const w=this.viewport.clientWidth,h=this.viewport.clientHeight;if(!w||!h)return;const aspect=w/h;this.renderer.setSize(w,h);if(this.camera.aspect!==aspect){this.camera.aspect=aspect;this.camera.updateProjectionMatrix();if(!this.customView)this.frameCamera();}}
 drawWater(){
  const y=waterHeight(this.level),r=boundaryAt(this.profile,y),n=this.profile.count,p=this.water.geometry.attributes.position;this.water.position.y=y;this.water.visible=this.level>.001;this.water.material.opacity=.60*Math.min(1,this.level/.025);this.waterUniform.value=this.time;
  for(let k=1;k<=this.rings;k++)for(let i=0;i<n;i++){const a=i/n*Math.PI*2,f=k/this.rings,idx=1+(k-1)*n+i;const wave=Math.sin(a*3+f*22-this.time*2)*.0005*(1-f);p.setXYZ(idx,Math.cos(a)*r[i]*f,wave,Math.sin(a)*r[i]*f);}p.needsUpdate=true;
  const rinse=this.topic==='clean'&&this.cleaning.phase==='rinsing'&&this.cleaning.rinse>.55,runningWater=this.inflow||rinse;
  const impact=new THREE.Vector3(0,y+.001,-.12),streamTop=.21;this.stream.visible=runningWater;this.stream.position.set(impact.x,(streamTop+y)/2,impact.z);this.stream.scale.y=streamTop-y;
  const dummy=this.flowDummy,exit=hasOutflow(this.mode,this.inflow,this.level),exitLength=.21;
  this.inletDrops.visible=runningWater;this.splash.visible=runningWater;this.outletDrops.visible=exit;this.outflow.visible=exit;
  for(let i=0;i<28;i++){const phase=(this.time*1.7+i/28)%1;dummy.position.set(impact.x+Math.sin(i*7)*.005,streamTop-phase*(streamTop-y),impact.z+Math.cos(i*4)*.005);dummy.scale.set(.65,1.7,.65);dummy.updateMatrix();this.inletDrops.setMatrixAt(i,dummy.matrix);}this.inletDrops.instanceMatrix.needsUpdate=true;
  for(let i=0;i<12;i++){const phase=(this.time*1.1+i/12)%1,a=i*Math.PI*2/12;dummy.position.set(impact.x+Math.cos(a)*phase*.043,y+Math.sin(phase*Math.PI)*.024,impact.z+Math.sin(a)*phase*.043);dummy.scale.setScalar((1-phase)*.65);dummy.updateMatrix();this.splash.setMatrixAt(i,dummy.matrix);}this.splash.instanceMatrix.needsUpdate=true;
  this.outflow.position.copy(this.outlet);this.outflow.position.y-=exitLength/2;this.outflow.scale.y=exitLength;
  for(let i=0;i<24;i++){const phase=(this.time*1.8+i/24)%1;dummy.position.set(this.outlet.x+Math.sin(i*9)*.008*phase,this.outlet.y-phase*exitLength,this.outlet.z+Math.cos(i*5)*.008*phase);dummy.scale.set(.8,1.9,.8);dummy.updateMatrix();this.outletDrops.setMatrixAt(i,dummy.matrix);}this.outletDrops.instanceMatrix.needsUpdate=true;
  const pressPoint=this.basketMotion.pressPoint();this.pressHighlight.position.copy(pressPoint);
  const visibilityKey=[...this.camera.position.toArray(),...this.camera.quaternion.toArray(),pressPoint.y].join(',');
  if(visibilityKey!==this.visibilityKey){this.visibilityKey=visibilityKey;this.pressVisible=pressIsVisible(this.model,this.camera,pressPoint);}
  this.placeLabel('.water-press',pressPoint,this.pressVisible);
  this.ripples.forEach((ring,i)=>{const phase=(this.time*.65+i/4)%1;ring.visible=runningWater&&this.level>.005;ring.position.copy(impact);ring.scale.setScalar(.008+phase*.04);ring.material.opacity=(1-phase)*.45;});
  this.lines.forEach((line,i)=>{line.visible=this.mode==='drain'&&this.level>.001;const attr=line.geometry.attributes.position,phase=(this.time*.28+i/10)%1;for(let j=0;j<12;j++){const t=Math.min(1,phase+j*.011),radius=.095*(1-t)+.018,a=i/10*Math.PI*2+t*.8;attr.setXYZ(j,Math.cos(a)*radius,y+.0014,Math.sin(a)*radius-.055);}attr.needsUpdate=true;line.material.opacity=Math.sin(phase*Math.PI)*.65;});
  this.pressHighlight.visible=this.pressVisible;
  const c=this.cleaning,clean=this.topic==='clean';
  this.cleaningDose.visible=clean&&c.phase==='soaking'&&c.progress<.4;
  if(this.cleaningDose.visible){for(let i=0;i<40;i++){const t=THREE.MathUtils.clamp((c.progress*2.5-i*.01)/.6,0,1);dummy.position.set(.08+Math.sin(i*7)*.014,.13-t*(.13-y),-.02+Math.cos(i*4)*.014);dummy.scale.setScalar(t>=1?0:1);dummy.updateMatrix();this.cleaningDose.setMatrixAt(i,dummy.matrix);}this.cleaningDose.instanceMatrix.needsUpdate=true;}
  const cloudy=clean?c.liquid:0;
  this.cleanWaterColor??=new THREE.Color(0x63bad8);this.cloudWaterColor??=new THREE.Color();
  this.cloudWaterColor.set(c.cleaner==='citric'?0xf5f3e8:0xdfb343);
  this.water.material.color.copy(this.cleanWaterColor).lerp(this.cloudWaterColor,cloudy);
  this.water.material.opacity=(.60+.34*cloudy)*Math.min(1,this.level/.025);this.water.material.roughness=.19+.44*cloudy;
  this.outflow.material.color.set(0x32aee8).lerp(this.cloudWaterColor,cloudy);this.outflow.material.opacity=.5+.36*cloudy;
  this.outletDrops.material.color.set(0x65d2ff).lerp(this.cloudWaterColor,cloudy);
  const clock=this.el.querySelector('.cleaning-clock');clock.hidden=!clean||!['soaking','ready','rinsing','done'].includes(c.phase);
  const minute=String(Math.floor(c.progress*20));if(clock.querySelector('strong').textContent!==minute)clock.querySelector('strong').textContent=minute;

  if(clean&&!['dirty','interrupted'].includes(c.phase)){this.pressHighlight.visible=false;this.el.querySelector('.water-press').hidden=true;}


 }
 updateUI(){
  const odor=this.topic==='odor',clean=this.topic==='clean';this.el.dataset.topic=this.topic;
  this.el.querySelector('.cleaning-together').hidden=!clean;this.el.querySelector('.cleaning-options').hidden=!clean;this.el.querySelector('.cleaning-warning').hidden=!clean||!this.warningVisible;this.el.querySelector('.warning-reopen').hidden=!clean;this.el.querySelector('.cleaning-reference').hidden=!clean;this.el.querySelector('.water-meter').setAttribute('aria-label','示意蓄水程度');this.el.querySelector('[data-water=topic-clean]').setAttribute('aria-pressed',clean);this.el.querySelector('[data-water=clean-start]').hidden=!clean;
  this.el.querySelector('[data-water=topic-water]').setAttribute('aria-pressed',this.topic==='water');this.el.querySelector('[data-water=topic-odor]').setAttribute('aria-pressed',odor);
  this.el.querySelector('.water-heading strong').textContent=odor?'整組水槽 · 止臭示意':'整組水槽 · 蓄排水示意';
  this.el.querySelector('[data-water=front]').textContent=odor?'上方看異味':'正面看蓄水';this.el.querySelector('[data-water=below]').textContent=odor?'下方看來源':'下方看排水';
  this.el.querySelector('[data-water=seal]').textContent=odor?'止水阻隔異味':'止水蓄水';this.el.querySelector('[data-water=drain]').textContent='解除止水';
  this.el.querySelector('.water-meter').hidden=odor;for(const action of ['inlet','replay'])this.el.querySelector(`[data-water=${action}]`).hidden=odor||this.detailOpen||(clean&&action==='inlet');
  this.el.querySelector('.water-footnote').textContent=odor?'淡綠色煙霧代表異味，僅示意開啟與密封的差異；不代表實際氣體顏色或濃度。':'濾籃上下行程約 1.5 cm；水位與流速為操作示意，不代表實際蓄水容量或排水效能。';
  const status=this.paused?'示意已暫停':odor?(this.mode==='seal'?'止水密封 · 阻隔下方異味':'解除止水 · 異味向上飄散'):this.mode==='seal'?(this.inflow&&this.level<1?'止水中 · 水位上升':'止水中 · 保持水位'):(this.inflow&&this.level<=.05?'排水中 · 持續進水':this.level>.001?'排水中 · 水位下降':'排水完成');
  if(status!==this.lastStatus){this.el.querySelector('.water-status strong').textContent=status;this.lastStatus=status;}
  this.el.dataset.mode=this.mode;this.el.querySelector('.water-press span').textContent=this.mode==='seal'?'解除止水':odor?'止水防臭':'止水蓄水';this.el.querySelector('.water-press').setAttribute('aria-label',this.mode==='seal'?'按壓濾網中央，解除止水':'按壓濾網中央，止水蓄水');this.el.querySelector('.water-meter').setAttribute('aria-valuenow',Math.round(this.level*100));this.el.querySelector('.water-meter i').style.width=`${this.level*100}%`;
  this.el.querySelector('.water-explanation').textContent=odor?(this.mode==='seal'?'止水部位關閉後，異味留在下方；上方已飄出的煙霧逐漸消散。':'淡綠色煙霧示意異味由排水管向上飄。按下止水，觀察密封前後的差異。'):this.mode==='seal'?'止水後，進入水槽的水會逐漸累積。點「解除止水」觀察水位下降。':'排水口開啟，水流往濾網集中。點「止水蓄水」觀察整個水槽的水位變化。';
  for(const mode of ['seal','drain'])this.el.querySelector(`[data-water=${mode}]`).setAttribute('aria-pressed',this.mode===mode);
  this.el.querySelector('[data-water=replay]').textContent=clean?'重新示意':'重播蓄水';
  const inlet=this.el.querySelector('[data-water=inlet]');inlet.textContent=this.inflow?'關閉進水':'開啟進水';inlet.setAttribute('aria-pressed',this.inflow);
  if(this.detailOpen){if(!odor&&!this.paused){this.el.querySelector('.water-status strong').textContent=this.mode==='seal'?'止水關閉 · 水留在上方':'止水開啟 · 水向下排出';this.lastStatus='';}this.el.querySelector('.water-meter').hidden=true;this.el.querySelector('.water-explanation').textContent=odor?(this.mode==='seal'?'止水關閉後，淡綠色氣流停留在密封處下方，上方殘留逐漸消散。':'淡綠色氣流由下方往上，沿止水部位周圍通過，從上方開口飄散。'):(this.mode==='seal'?'濾籃下降約 1.5 cm，止水部位關閉，水留在上方。':'藍色流線示意水通過渣籃側邊與底部孔洞，再流向下方出口。');this.el.querySelector('.water-footnote').textContent='剖面依模型生成；流線、密封標示與上下作動為原理示意，供確認。';}
  this.el.querySelector('[data-water=topic-filter]').setAttribute('aria-pressed',this.topic==='filter');
  if(this.topic==='filter'){this.el.querySelector('.water-status strong').textContent=this.paused?'示意已暫停':'菜渣留在籃內 · 水流持續向下';this.el.querySelector('.water-explanation').textContent='彩色顆粒代表菜渣，留在渣籃內；藍色水流經上緣縫隙、側邊與底部孔洞進入杯體，再由下方排出。點「看上蓋遮蔽」比較外觀。';this.el.querySelector('.water-footnote').textContent='顆粒尺寸、數量與流速為原理示意；孔洞仍需定期清理，不代表滿籃或堵塞時的排水效能。';this.el.querySelector('[data-water=replay]').hidden=false;this.el.querySelector('[data-water=replay]').textContent='重新示意';this.el.querySelector('[data-water=seal]').hidden=true;this.el.querySelector('[data-water=drain]').hidden=true;}else{this.el.querySelector('[data-water=seal]').hidden=false;this.el.querySelector('[data-water=drain]').hidden=false;}
  if(clean)this.updateCleaningUI();
  const pause=this.el.querySelector('[data-water=pause]');pause.hidden=clean;pause.textContent=this.paused?'繼續播放':'暫停';pause.setAttribute('aria-pressed',this.paused);
 }
 updateCleaningUI(){
  const c=this.cleaning;if(!c)return;
  const name=c.cleaner==='citric'?'檸檬酸':'過碳酸鈉',canStart=this.mode==='seal'&&this.level>=.95&&['dirty','interrupted'].includes(c.phase);
  this.el.querySelector('.water-heading strong').textContent='整組水槽 · 浸泡清潔示意';
  this.el.querySelector('[data-water=clean-citric]').setAttribute('aria-pressed',c.cleaner==='citric');
  this.el.querySelector('[data-water=clean-oxygen]').setAttribute('aria-pressed',c.cleaner==='oxygen');
  for(const a of ['clean-citric','clean-oxygen'])this.el.querySelector(`[data-water=${a}]`).disabled=['soaking','ready','rinsing'].includes(c.phase);
  const start=this.el.querySelector('[data-water=clean-start]');start.disabled=!canStart;
  start.textContent=c.phase==='soaking'?'浸泡中…':c.phase==='ready'?'浸泡示意完成':`加入${name}`;
  this.el.querySelector('[data-water=drain]').textContent=c.phase==='ready'?'排水並沖洗':'解除止水';
  const labels={dirty:this.mode==='seal'?(this.level<.95?'② 止水蓄水 · 等水淹過髒污':'③ 加入一種清潔劑'):'① 使用後的水槽 · 觀察髒污',soaking:`④ 浸泡中 · 觀察髒污溶入水中`,ready:'⑤ 浸泡示意完成 · 接著排水沖洗',rinsing:'⑥ 排水、擦洗並沖淨 · 加速示意',done:'清潔流程完成 · 最後擦乾水槽',interrupted:'已提前排水 · 可重新蓄水示範'};
  this.el.querySelector('.water-status strong').textContent=this.paused?'示意已暫停':labels[c.phase];this.lastStatus='';
  const text={dirty:this.mode==='seal'?`水位升高後，點「加入${name}」開始浸泡示意。依清潔劑標示調配，請勿混用。`:(c.cleaner==='citric'?'白色斑點代表水垢。先清倒菜渣，再按「止水蓄水」。':'褐色斑點代表使用後的污漬。先清倒菜渣，再按「止水蓄水」。'),soaking:c.cleaner==='citric'?'白斑逐漸淡去，水呈乳白色，示意水垢溶入水中。':'污漬逐漸淡去，水呈淡黃色，示意污垢溶入水中。',ready:'浸泡示意完成。點「排水並沖洗」，觀察混濁的清潔液排出，露出清潔後的水槽。',rinsing:'混濁的清潔液由下方排出，水位下降後露出乾淨槽壁；實際操作請以清水充分沖淨，必要時用柔軟海綿擦洗。',done:'充分沖淨後擦乾，有助減少水滴留下的白色水痕。可切換另一種污漬重新觀看。',interrupted:'浸泡已中止，不顯示完成清潔；重新蓄水後可以再開始。'};
  this.el.querySelector('.water-explanation').textContent=text[c.phase];
  this.el.querySelector('.water-footnote').textContent='0～20 分鐘以約 2.5 秒加速呈現；水色、泡泡與去污為示意。實際材質適用性、用量、水溫與浸泡時間，請依水槽與清潔劑標示。';
  const soaking=['soaking','ready'].includes(c.phase),meter=this.el.querySelector('.water-meter');meter.setAttribute('aria-label',soaking?'加速浸泡示意進度':'示意蓄水程度');meter.setAttribute('aria-valuenow',Math.round((soaking?c.progress:this.level)*100));this.el.querySelector('.water-meter i').style.width=`${(soaking?c.progress:this.level)*100}%`;
 }
 wake(){if(this.raf||!this.ready)return;let last=performance.now();const tick=now=>{this.raf=0;if(!this.el.isConnected||!this.onScreen)return;const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden){if(!this.paused){this.time+=dt;this.basketMotion.update(this.mode==='seal',dt);this.level=advanceWater(this.level,this.mode,this.inflow,dt,this.topic==='clean'?3:8);if(this.level>=1&&this.mode==='seal')this.inflow=false;}this.cleaning.update(this.paused?0:dt,this.topic==='clean',this.mode==='seal',this.level);this.drawWater();this.cleanSparkle.draw(this.paused?0:dt,this.topic==='clean',this.cleaning.phase);this.soakBubbles.draw(this.paused?0:dt,this.topic==='clean'&&this.mode==='seal'&&this.level>.01,['soaking'].includes(this.cleaning.phase),waterHeight(this.level));this.odor.draw(this.paused?0:dt,this.mode==='seal',this.topic==='odor');this.el.querySelector('.odor-label').textContent=this.mode==='seal'?'異味留在下方':'管內異味 ↑';this.placeLabel('.odor-label',new THREE.Vector3(this.outlet.x+.035,this.outlet.y-.1,this.outlet.z),this.topic==='odor');if(!this.uiTime||now-this.uiTime>150){this.updateUI();this.uiTime=now;}if(this.detailOpen)this.detail.draw(dt,this.topic,this.mode==='seal',this.paused);else this.renderer.render(this.scene,this.camera);}this.raf=requestAnimationFrame(tick);};this.raf=requestAnimationFrame(tick);}
}

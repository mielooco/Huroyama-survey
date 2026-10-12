import {modelProgress} from './loading-progress.js?v=media-start1';
import {guardViewerWheel} from './mobile-viewer.js?v=clean-ui2';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {partNodes,setExplosion,pickPart,widenAdapterRing} from './model-actions.js?v=ring101';

import {renderDimensions} from './dimensions.js?v=spec112';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const brandColor=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const parts=[
 {id:'lid',name:'濾網上蓋',text:'位於渣籃上方，遮蔽下方的菜渣。'},
 {id:'basket',name:'金屬渣籃',text:'側面與底部設有孔洞，可在展開視圖查看籃體結構。'},
 {id:'valve',name:'彈跳止水閥',text:'位於中央的止水組件，包含彈跳芯、彈簧與止水矽膠。按壓可形成密封，提供止水蓄水功能。'},
 {id:'ring',name:'矽膠適配環',text:'環繞杯體上緣，位於產品與原排水座之間。協助產品與排水座之間的密封。'},
 {id:'cup',name:'濾網杯體',text:'容納渣籃與止水組件的外側杯體；安裝時放入原有排水座內。'}
];
const state={tab:'dimensions',model:'filter',part:null,explode:0,rotate:false,focus:false};
const models={},loadPromises={};
let renderer,scene,camera,controls,raycaster,needsRender=true,draws=0;
const viewport=$('#viewport');
const mobileParts=document.createElement('div');mobileParts.className='mobile-parts';mobileParts.hidden=true;viewport.after(mobileParts);
const invalidate=()=>{needsRender=true;};
function rows(){return `<div class="parts-list">${parts.map((p,i)=>`<button class="part-row ${state.part===p.id?'active':''}" data-part="${p.id}" aria-pressed="${state.part===p.id}"><span class="part-number">0${i+1}</span><span class="part-text">${p.name}</span><span class="part-arrow">↗</span></button>`).join('')}</div>`;}
function selectedInfo(){const p=parts.find(p=>p.id===state.part);return p?`<div class="detail-box"><h3>${p.name}</h3><p>${p.text}</p></div>`:'';}
function panel(){
 const handle=state.model==='handle',sink=state.model==='sink';let html='';
 if(state.tab==='installation')html=`<p class="panel-kicker">SEE HOW IT FITS</p><h2>放進水槽，看懂安裝位置。</h2><span class="mini-label">此款水槽已實際安裝確認</span><p class="panel-description">取出原有濾籃，保留水槽與原排水座，再放入浴山濾網。此視圖依提供的安裝組合呈現。</p><div class="installation-actions"><button class="primary-button" data-action="focus">${state.focus?'查看整個水槽':'近看排水口'} <span>↗</span></button></div><p class="info-callout"><strong>這是已確認可用的安裝範例。</strong><br>其他水槽仍需核對排水座內徑、可用深度與承接面形狀。水槽外觀或產品外徑相同，不能單獨作為相容依據。</p>`;
 if(state.tab==='parts')html=`<p class="panel-kicker">EVERY PART, IN VIEW</p><h2>展開看看，裡面有什麼？</h2><p class="panel-description">拖動下方滑桿，五個部件會沿上下方向展開。點選名稱可標示對應零件。</p>${rows()}${selectedInfo()}<p class="info-callout">展開圖用來辨識結構，<strong>不代表實際拆卸方向、順序或使用者可拆範圍。</strong></p>`;
 if(state.tab==='dimensions')html=`<p class="panel-kicker">LENGTH · WIDTH · HEIGHT</p><h2>${handle?'提把的立體尺寸':'看懂產品佔用的空間。'}</h2><p class="panel-description">拖曳旋轉，從三個方向查看產品的最大尺寸。數值直接標在虛線框邊上，並隨視角轉動。</p><div class="dimension-specs"><div class="dimension-spec axis-x"><span>長 · X</span><strong>${handle?'2.3':'11.2'}<small> cm</small></strong></div><div class="dimension-spec axis-z"><span>寬 · Z</span><strong>${handle?'2.9':'11.2'}<small> cm</small></strong></div><div class="dimension-spec axis-y"><span>高 · Y</span><strong>${handle?'18.5':'10.8'}<small> cm</small></strong></div></div><p class="panel-description dimension-explainer">${handle?'依目前擺放方向標示，數值為模型最大外包尺寸。':'產品長、寬為 11.2 cm，總高約 10.8 cm。'}</p><span class="mini-label">單位：cm · 模型尺寸取至小數一位</span><p class="info-callout"><strong>外包尺寸供空間判讀，不等於適用孔徑。</strong><br>安裝仍需核對排水座內徑、可用深度與承接面形狀。</p>`;
 $('#panel-content').innerHTML=html;
 $('.details').classList.toggle('dimensions-details',state.tab==='dimensions');
 $('.details').classList.toggle('parts-details',state.tab==='parts');$('.viewer-panel').classList.toggle('parts-mode',state.tab==='parts');
 const scroll=mobileParts.querySelector('.parts-list')?.scrollLeft||0,focused=mobileParts.contains(document.activeElement);
 mobileParts.hidden=state.tab!=='parts';mobileParts.innerHTML=state.tab==='parts'?rows()+(selectedInfo()||'<div class="detail-box"><p>左右滑動名稱，點選部件查看模型。</p></div>'):'';
 if(state.tab==='parts'){mobileParts.querySelector('.parts-list').scrollLeft=scroll;if(focused)mobileParts.querySelector(`[data-part="${state.part}"]`)?.focus({preventScroll:true});}

 $$('.model-switch button').forEach(b=>{const on=b.dataset.tab==='parts'?state.tab==='parts':b.dataset.model===state.model&&state.tab!=='parts';b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});
 $('#explode-controls').hidden=state.tab!=='parts';$('#explode-note').hidden=state.tab!=='parts';
 viewport.classList.toggle('dimension-mode',state.tab==='dimensions');
 $('#dimensions-overlay').toggleAttribute('hidden',state.tab!=='dimensions');
 $('#scene-label').textContent=sink?'INSTALLED VIEW':state.tab==='parts'?'COMPONENT VIEW':state.tab==='dimensions'?'DIMENSION VIEW':'ASSEMBLED VIEW';
 $('#scene-name').textContent=state.part&&state.tab!=='dimensions'?parts.find(p=>p.id===state.part)?.name:handle?'專用提把・獨立配件':sink?'浴山濾網 × 水槽安裝':'廚房濾網';
 invalidate();
}
function highlight(){
 for(const model of Object.values(models))model.traverse(o=>{if(o.isMesh){
  const material=o.material;
  o.userData.originalAppearance??={color:material.color.clone(),emissive:material.emissive.clone(),emissiveIntensity:material.emissiveIntensity,metalness:material.metalness,roughness:material.roughness,opacity:material.opacity,transparent:material.transparent};
  const original=o.userData.originalAppearance,chosen=state.part&&pickPart(o)===state.part;
  material.color.copy(original.color);material.emissive.copy(original.emissive);material.emissiveIntensity=original.emissiveIntensity;material.metalness=original.metalness;material.roughness=original.roughness;material.opacity=original.opacity;material.transparent=original.transparent;
  if(chosen){material.color.set('#ef861e');material.emissive.set('#f27416');material.emissiveIntensity=.35;material.metalness=.15;material.roughness=.45;material.opacity=1;material.transparent=false;}material.needsUpdate=true;
 }});invalidate();
}
function bounds(){const m=models[state.model];return m?new THREE.Box3().setFromObject(state.model==='sink'&&state.focus?m.getObjectByName('huroyama_product'):m):null;}
function fit(front=false){if(!camera)return;const b=bounds();if(!b)return;if(state.tab==='dimensions'){b.expandByScalar(.022);front=false;}const size=b.getSize(new THREE.Vector3()),center=b.getCenter(new THREE.Vector3());const max=Math.max(size.y,size.x/Math.max(camera.aspect,.4),size.z);const dist=max/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2))*1.45;const dir=front?new THREE.Vector3(0,.015,1).normalize():new THREE.Vector3(.95,state.tab==='dimensions'?.65:state.model==='sink'&&!state.focus?.85:.5,1).normalize();camera.position.copy(center).addScaledVector(dir,dist);controls.target.copy(center);controls.minDistance=max*.4;controls.maxDistance=max*6;controls.update();invalidate();}
function explode(value,refit=true){state.explode=value;$('#explode').value=value;$('#explode-value').value=`${Math.round(value)}%`;if(models.filter)setExplosion(models.filter,value);if(refit&&state.model==='filter')fit();invalidate();}
function loadModel(name){
 if(models[name])return Promise.resolve(models[name]);if(loadPromises[name])return loadPromises[name];
 loadPromises[name]=new Promise((resolve,reject)=>{new GLTFLoader().load(`./assets/${name}.glb?v=installed9mm`,gltf=>{
  const wrap=new THREE.Group();wrap.add(gltf.scene);if(name==='handle')gltf.scene.rotation.z=Math.PI;
  if(name==='filter')widenAdapterRing(wrap);
  if(name==='sink')setExplosion(wrap,0);
  wrap.updateMatrixWorld(true);const center=new THREE.Box3().setFromObject(wrap).getCenter(new THREE.Vector3());gltf.scene.position.sub(center);wrap.name=name;wrap.visible=false;
  wrap.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.envMapIntensity=1.1;}});
  scene.add(wrap);models[name]=wrap;resolve(wrap);
 },evt=>{if(state.model===name)$('#loading-progress').textContent=modelProgress(name,evt.loaded);},err=>{delete loadPromises[name];reject(err);});});return loadPromises[name];
}
async function changeModel(name,view){
 state.model=name;state.part=null;state.focus=false;
 state.tab=view||(name==='sink'?'installation':'dimensions');
 panel();Object.values(models).forEach(m=>m.visible=false);invalidate();
 $('#loading').classList.remove('hidden');$('#loading-progress').textContent=name==='sink'?'正在下載水槽安裝模型（約 5.1 MB）':'正在載入模型';
 try{await loadModel(name);if(state.model!==name)return;Object.entries(models).forEach(([id,m])=>m.visible=id===name);$('#loading').classList.add('hidden');
  if(name==='filter')explode(state.tab==='parts'?state.explode||100:0,false);highlight();fit(state.tab==='dimensions');
 }catch(e){console.error(e);if(state.model===name){$('#loading-progress').textContent='模型載入失敗，請確認網路後重試。';$('#loading-retry').hidden=false;}}
}
async function tab(name){
 const view=['parts','installation','dimensions'].includes(name)?name:'parts';
 await changeModel(view==='installation'?'sink':'filter',view);
}
async function selectPart(id){if(state.tab!=='parts')return;state.part=id;highlight();panel();}
function dimensionPosition(){if(state.tab==='dimensions'&&models[state.model])renderDimensions($('#dimensions-overlay'),bounds(),camera,viewport.clientWidth,viewport.clientHeight,state.model==='filter'?{X:.112,Z:.112}:{});}
function setup(){
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(brandColor('--viewer-bg'),0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;viewport.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-label','拖曳旋轉模型，雙指縮放');
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.001,20);guardViewerWheel(renderer.domElement);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.enablePan=false;controls.autoRotateSpeed=.6;controls.addEventListener('change',invalidate);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();scene.add(new THREE.HemisphereLight('#ffffff','#a0b3c2',2));const light=new THREE.DirectionalLight('#ffffff',2.5);light.position.set(.4,.7,.5);scene.add(light);
 raycaster=new THREE.Raycaster();new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();fit(state.tab==='dimensions');invalidate();}).observe(viewport);
 let down=null;renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});renderer.domElement.addEventListener('pointerup',e=>{
  if(state.tab!=='parts'||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5||state.model==='handle'||!models[state.model])return;
  const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
  const hit=raycaster.intersectObject(models[state.model],true)[0];
  if(hit){const id=pickPart(hit.object);if(id)selectPart(id);}
 });
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('#loading').classList.remove('hidden');$('#loading-progress').textContent='3D 顯示暫停，請重新整理頁面。';$('#loading-retry').hidden=false;});
 let modelOnScreen=true;new IntersectionObserver(entries=>{modelOnScreen=entries[0].isIntersecting;if(modelOnScreen)invalidate();}).observe(viewport);
 function frame(){requestAnimationFrame(frame);if(!modelOnScreen||document.hidden||$('#model-reference').hidden)return;controls.update();if(needsRender||controls.autoRotate){renderer.render(scene,camera);dimensionPosition();needsRender=false;draws++;}}
 requestAnimationFrame(frame);window.__guide={state,models,get renderer(){return renderer;},get draws(){return draws;},selectPart,tab,changeModel,explode};
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.tab)tab(b.dataset.tab);if(b.dataset.model)changeModel(b.dataset.model);if(b.dataset.part)selectPart(b.dataset.part);
 if(b.dataset.action==='parts')tab('parts');if(b.dataset.action==='installation')tab('installation');if(b.dataset.action==='product')changeModel('filter');if(b.dataset.action==='front')fit(true);
 if(b.dataset.action==='focus'){state.focus=!state.focus;fit();panel();}
});
$('#explode').addEventListener('input',e=>explode(Number(e.target.value)));
$('#rotate').addEventListener('click',()=>{if(!controls)return;state.rotate=!state.rotate;controls.autoRotate=state.rotate;$('#rotate').setAttribute('aria-pressed',state.rotate);invalidate();});
$('#reset').addEventListener('click',()=>{if(!controls)return;state.rotate=false;controls.autoRotate=false;$('#rotate').setAttribute('aria-pressed','false');state.part=null;state.focus=false;explode(state.tab==='parts'?100:0,false);highlight();panel();fit(state.tab==='dimensions');});
$('#loading-retry').addEventListener('click',()=>location.reload());
document.addEventListener('model-view',e=>tab(e.detail));
window.addEventListener('pageshow',invalidate);document.addEventListener('visibilitychange',invalidate);
panel();try{setup();changeModel('filter');}catch(e){console.error(e);$('#loading').innerHTML='<strong>此裝置無法顯示 3D 模型</strong><span>你仍可閱讀產品資訊。</span>';}

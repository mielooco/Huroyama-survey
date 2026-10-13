import {surfaceMaterial} from './surface-materials.js?v=brushed1';
import {CollectionEffect} from './collection-effect.js?v=basket-collection3';
import {guardViewerWheel} from './mobile-viewer.js?v=clean-ui2';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {DetailCallouts} from './detail-callouts.js?v=3';
import {DetailOutflow} from './detail-outflow.js';
import {ContourWater} from './detail-water-volume.js';
import {BasketMotion} from './basket-motion.js';
import {createWaterCurves,WATER_DROP_RADIUS,WATER_DROP_SCALE} from './detail-water-paths.js';

export class DetailView{
 constructor(host,source,basketBase){
  this.host=host;this.ready=false;this.time=0;this.odorFade=1;
  host.innerHTML=`<div class="detail-top"><strong>產品內部 · 剖面示意</strong></div><button class="collection-cover" data-detail="cover" hidden>看上蓋遮蔽</button><div class="detail-canvas"></div><div class="detail-loading" role="status">正在準備內部構造…</div><div class="detail-tools" role="group" aria-label="細節視角"><button data-detail="in" aria-label="放大內部細節">＋</button><button data-detail="out" aria-label="縮小內部細節">－</button><button data-detail="reset">重設</button></div><div class="detail-hint">上下拖曳看厚度 · 雙指縮放</div>`;
  this.viewport=host.querySelector('.detail-canvas');this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.localClippingEnabled=true;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.0;this.viewport.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','浴山濾網內部剖面，可上下拖曳並縮放');
  this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(32,1,.005,5);guardViewerWheel(this.renderer.domElement);this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enablePan=false;this.controls.minAzimuthAngle=0;this.controls.maxAzimuthAngle=0;this.controls.minPolarAngle=1.15;this.controls.maxPolarAngle=1.65;this.controls.minDistance=.17;this.controls.maxDistance=.9;this.controls.touches.TWO=THREE.TOUCH.DOLLY_ROTATE;this.controls.rotateSpeed=.35;
  const pm=new THREE.PMREMGenerator(this.renderer),room=new RoomEnvironment();this.environment=pm.fromScene(room,.04);this.scene.environment=this.environment.texture;room.dispose();pm.dispose();this.scene.add(new THREE.HemisphereLight(0xffffff,0x8e9da7,1.2));const light=new THREE.DirectionalLight(0xffffff,1.6);light.position.set(.3,.5,1);this.scene.add(light);
  this.model=source.clone(true);this.model.getObjectByName('basket').position.copy(basketBase);this.model.updateMatrixWorld(true);this.scene.add(this.model);this.motion=new BasketMotion(this.model);
  this.moving=['pop_up_column','stopper_seal','core_head'].map(name=>{const mesh=this.model.getObjectByName(name),base=mesh.position.clone(),world=mesh.getWorldPosition(new THREE.Vector3()),delta=mesh.parent.worldToLocal(world.clone().add(new THREE.Vector3(0,-.015,0))).sub(mesh.parent.worldToLocal(world));return {mesh,base,delta};});
  host.addEventListener('click',e=>{const a=e.target.closest('[data-detail]')?.dataset.detail;if(a==='cover')this.setCover(!this.coverView);if(a==='reset')this.frame();if(a==='in'||a==='out'){const v=this.camera.position.clone().sub(this.controls.target);v.setLength(THREE.MathUtils.clamp(v.length()*(a==='in'?.8:1.25),.17,.9));this.camera.position.copy(this.controls.target).add(v);this.controls.update();}});
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(this.viewport);this.load();
 }
 async load(){try{
  const response=await fetch('./assets/detail-caps.json');if(!response.ok)throw Error('detail caps');const caps=await response.json(),plane=new THREE.Plane(new THREE.Vector3(0,0,-1),caps.planeZ);this.plane=plane;
  const keep=new Set(caps.parts.map(p=>p.name));this.model.traverse(o=>{if(!o.isMesh)return;o.visible=keep.has(o.name);if(!o.visible)return;o.material=surfaceMaterial(o.material,o.name,{section:true});o.material.clippingPlanes=[plane];o.material.side=THREE.DoubleSide;
   if(o.name==='drain_housing'){o.material.color.set('#939fa6');o.material.roughness=.5;}
   if(o.name==='filter_cup')o.material.color.set('#b6c0c5');
   if(o.name==='basket_body')o.material.color.set('#c5cbce');
   if(o.name==='stopper_seal'||o.name==='adapter_ring_body'){o.material.color.set('#6ca9a0');o.material.metalness=0;o.material.roughness=.7;}
  });
  for(const part of caps.parts){const mesh=this.model.getObjectByName(part.name),inverse=mesh.matrixWorld.clone().invert(),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(part.positions,3));geometry.setIndex(part.indices);geometry.applyMatrix4(inverse);geometry.computeVertexNormals();const color=part.name==='stopper_seal'||part.name==='adapter_ring_body'?'#387b71':part.name==='drain_housing'?'#596871':'#849497';const cap=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));cap.name='section_cap';mesh.add(cap);
   const edgeGeo=new THREE.BufferGeometry();edgeGeo.setAttribute('position',new THREE.Float32BufferAttribute(part.lines,3));edgeGeo.applyMatrix4(inverse);const edge=new THREE.LineSegments(edgeGeo,new THREE.LineBasicMaterial({color:'#344e59',transparent:true,opacity:.8}));edge.name='section_edge';mesh.add(edge);
  }
  this.makeEffects(caps);this.callouts=new DetailCallouts(this.host,this.model,caps);this.frame();this.ready=true;this.host.querySelector('.detail-loading').hidden=true;this.resize();
 }catch(e){console.error(e);this.host.querySelector('.detail-loading').textContent='內部示意暫時無法載入，可返回水槽繼續觀看。';}}
 makeEffects(caps){
  this.waterPaths=[];const z=this.plane.constant+.0006;
  this.waterPaths=createWaterCurves(THREE,z).map(curve=>{const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(180)),new THREE.LineBasicMaterial({color:0x269fcb,transparent:true,opacity:.5}));this.scene.add(line);return {curve,line};});
  this.collectionPaths=createWaterCurves(THREE,z,true).map(curve=>{const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(180)),new THREE.LineBasicMaterial({color:0x69dbfa,transparent:true,opacity:.7}));line.visible=false;this.scene.add(line);return {curve,line};});
  this.collection=new CollectionEffect(z);this.scene.add(this.collection);
  this.waterDots=new THREE.InstancedMesh(new THREE.SphereGeometry(WATER_DROP_RADIUS,8,6),new THREE.MeshBasicMaterial({color:0x168faf}),40);this.waterDots.frustumCulled=false;this.scene.add(this.waterDots);this.dummy=new THREE.Object3D();
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(157,187,112,.8)');g.addColorStop(.5,'rgba(157,187,112,.35)');g.addColorStop(1,'rgba(157,187,112,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  this.smoke=Array.from({length:42},(_,i)=>{const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,opacity:.5,depthWrite:false,toneMapped:false}));this.scene.add(sprite);return sprite;});
  this.waterFill=new ContourWater(caps);this.scene.add(this.waterFill);this.outflow=new DetailOutflow(z);this.scene.add(this.outflow);
  this.sealCue=new THREE.Mesh(new THREE.PlaneGeometry(.053,.0035),new THREE.MeshBasicMaterial({color:0x438e7e,transparent:true,opacity:.65,depthWrite:false}));this.sealCue.position.set(0,-.287,z+.001);this.scene.add(this.sealCue);
 }
 setCover(covered){this.coverView=covered;this.host.querySelector('.detail-top strong').textContent=covered?'完整外觀 · 上蓋遮蔽菜渣':'產品內部 · 剖面示意';this.model.traverse(o=>{if(o.name==='section_cap'||o.name==='section_edge')o.visible=!covered;else if(o.isMesh&&o.material.clippingPlanes)o.material.clippingPlanes=covered?[]:[this.plane];});this.host.querySelector('[data-detail=cover]').textContent=covered?'返回剖面':'看上蓋遮蔽';this.controls.minPolarAngle=covered?.5:1.15;this.controls.maxPolarAngle=covered?1:1.65;this.frame();}
 frame(){const target=new THREE.Vector3(0,-.289,-.055),distance=this.camera.aspect<1?.5:.47;this.camera.position.copy(target).add(new THREE.Vector3(0,this.coverView?distance*.85:.09,distance));this.controls.target.copy(target);this.controls.update();}
 resize(){const w=this.viewport.clientWidth,h=this.viewport.clientHeight;if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.frame();}
 draw(dt,topic,sealed,paused){if(!this.ready)return;if(!this.initialized){this.motion.setAmount(sealed?1:0);this.odorFade=sealed?0:1;this.initialized=true;}if(!paused){this.time+=dt;this.motion.update(sealed,dt);this.odorFade=THREE.MathUtils.damp(this.odorFade,sealed?0:1,4,dt);}for(const m of this.moving)m.mesh.position.copy(m.base).addScaledVector(m.delta,this.motion.amount);this.model.updateMatrixWorld(true);
  const collecting=topic==='filter',water=topic==='water'||collecting,z=this.plane.constant+.001;
  if(this.lastTopic!==topic){if(this.coverView)this.setCover(false);if(collecting)this.collection.reset();this.lastTopic=topic;}
  this.host.querySelector('[data-detail=cover]').hidden=!collecting;
  this.collection.draw(dt,collecting,paused);
  const paths=collecting?this.collectionPaths:this.waterPaths;
  this.waterDots.visible=water&&!this.coverView;this.waterPaths.forEach(p=>{p.line.visible=water&&!collecting&&!sealed&&!this.coverView;});this.collectionPaths.forEach(p=>{p.line.visible=collecting&&!sealed&&!this.coverView;});
  for(let i=0;i<40;i++){const path=paths[i%paths.length],phase=(this.time*.23+Math.floor(i/paths.length)/Math.ceil(40/paths.length))%1,t=sealed?phase*.36:phase;this.dummy.position.copy(path.curve.getPoint(t));this.dummy.scale.set(...WATER_DROP_SCALE);this.dummy.updateMatrix();this.waterDots.setMatrixAt(i,this.dummy.matrix);}this.waterDots.instanceMatrix.needsUpdate=true;
  this.waterFill.update(dt,sealed,paused,this.motion.amount,water);this.outflow.draw(this.time,sealed,this.waterFill.amount,water);this.sealCue.visible=sealed;this.sealCue.position.y=-.272-.015*this.motion.amount;
  this.smoke.forEach((sprite,i)=>{sprite.visible=!water;const upper=i>=24,f=(this.time*(upper?.25:.35)+(i%24)/24)%1,range=upper?.22:.126,y=upper?-.285+f*range:-.415+f*range;const x=Math.sin(i*2.4+f*4)*(upper?.022+f*.025:.003+f*.009);sprite.position.set(x,y,z+.0003);sprite.scale.setScalar(upper?.012+f*.015:.008+f*.01);sprite.material.opacity=Math.sin(f*Math.PI)*.55*(upper?this.odorFade:1);});
  this.callouts.draw(this.camera,sealed);if(this.coverView){this.callouts.svg.style.visibility='hidden';for(const item of this.callouts.bindings)item.label.hidden=true;}this.renderer.render(this.scene,this.camera);
 }
}

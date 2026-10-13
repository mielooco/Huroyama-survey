import * as THREE from './vendor/three.module.js';

export const FILL_BOTTOM=-.286;
export const FILL_TOP=-.216;
// Intersect the CAD-derived cut edges with a horizontal water level.
export function sectionXs(part,y){
 const xs=[];
 for(let i=0;i<part.lines.length;i+=6){const [x1,y1,,x2,y2]=part.lines.slice(i,i+6);if((y1<=y&&y<y2)||(y2<=y&&y<y1))xs.push(x1+(y-y1)*(x2-x1)/(y2-y1));}
 return xs.sort((a,b)=>a-b).filter((x,i,a)=>!i||Math.abs(x-a[i-1])>1e-8);
}
export function makeFillProfile(caps){
 const cup=caps.parts.find(p=>p.name==='filter_cup');
 return Array.from({length:281},(_,i)=>{const y=FILL_BOTTOM+(FILL_TOP-FILL_BOTTOM)*i/280;const xs=sectionXs(cup,y).filter(x=>x>0);if(xs.length<2)throw Error('Missing inner cup boundary');return {y,r:xs[0]-.0002};});
}
export function advanceDetailFill(amount,sealed,dt){return THREE.MathUtils.clamp(amount+(sealed?dt/2.8:-dt/1.7),0,1);}
export class ContourWater extends THREE.Group{
 constructor(caps){
  super();this.profile=makeFillProfile(caps);this.z=caps.planeZ-.00015;this.amount=0;
  this.levelPlane=new THREE.Plane(new THREE.Vector3(0,-1,0),FILL_BOTTOM);
  const material=(opacity,clipped=true)=>new THREE.MeshBasicMaterial({color:0x66c4c5,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide,clippingPlanes:clipped?[this.levelPlane]:[]});
  const points=[];
  for(let i=0;i<this.profile.length-1;i++){const a=this.profile[i],b=this.profile[i+1];points.push(-a.r,a.y,this.z,a.r,a.y,this.z,b.r,b.y,this.z,-a.r,a.y,this.z,b.r,b.y,this.z,-b.r,b.y,this.z);}
  const section=new THREE.BufferGeometry();section.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  // This cut face sits behind the real solid caps. The basket, shaft, seal and
  // their moving cap faces occlude it, instead of being painted blue.
  this.add(new THREE.Mesh(section,material(.32)));
  const skin=new THREE.LatheGeometry(this.profile.map(p=>new THREE.Vector2(p.r,p.y)),64,Math.PI/2,Math.PI);
  const shell=new THREE.Mesh(skin,material(.08));shell.position.z=this.z;this.add(shell);
  this.surfaceGeometry=new THREE.BufferGeometry();this.surfacePositions=new Float32Array(64*18);this.surfaceGeometry.setAttribute('position',new THREE.BufferAttribute(this.surfacePositions,3));
  this.surface=new THREE.Mesh(this.surfaceGeometry,material(.38,false));this.surface.frustumCulled=false;this.add(this.surface);
  this.central=caps.parts.filter(p=>/^(basket_head|basket_screw|pop_up_column|core_|spring|position_ring|stopper_seal)/.test(p.name));
 }
 update(dt,sealed,paused,motion,water){
  if(!paused)this.amount=advanceDetailFill(this.amount,sealed,dt);
  this.visible=water&&this.amount>.001;
  const y=FILL_BOTTOM+(FILL_TOP-FILL_BOTTOM)*this.amount;this.levelPlane.constant=y;
  const index=this.amount*(this.profile.length-1),i=Math.floor(index),a=this.profile[i],b=this.profile[Math.min(i+1,this.profile.length-1)];const r=THREE.MathUtils.lerp(a.r,b.r,index-i);
  let inner=0;for(const part of this.central){const moving=/^(basket_|pop_up_column$|stopper_seal$|core_head$)/.test(part.name);for(const x of sectionXs(part,y+(moving?.015*motion:0)))inner=Math.max(inner,Math.abs(x));}inner=Math.min(r,inner+.00015);
  let n=0;const write=(radius,angle)=>{this.surfacePositions[n++]=radius*Math.cos(angle);this.surfacePositions[n++]=y;this.surfacePositions[n++]=this.z-radius*Math.sin(angle);};
  for(let j=0;j<64;j++){const p=j*Math.PI/64,q=(j+1)*Math.PI/64;write(inner,p);write(r,p);write(r,q);write(inner,p);write(r,q);write(inner,q);}
  this.surfaceGeometry.attributes.position.needsUpdate=true;
 }
}

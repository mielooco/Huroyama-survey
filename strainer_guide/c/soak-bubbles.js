import * as THREE from 'three';
import {boundaryAt} from './water-logic.js?v=c1';

// Lightweight surface bubbles: an illustrative animation, not reaction chemistry.
export class SoakBubbles {
 constructor(scene,profile){
  this.profile=profile;this.time=0;this.strength=0;this.count=38;this.dummy=new THREE.Object3D();
  const material=new THREE.MeshPhysicalMaterial({color:0xc1ece6,metalness:.05,roughness:.12,transparent:true,opacity:.5,depthWrite:false,clearcoat:1,envMapIntensity:1.5});
  this.bubbles=new THREE.InstancedMesh(new THREE.SphereGeometry(1,12,8),material,this.count);
  this.rings=new THREE.InstancedMesh(new THREE.RingGeometry(.86,1,24),new THREE.MeshBasicMaterial({color:0x609f9d,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide}),this.count);
  for(const mesh of [this.bubbles,this.rings]){mesh.frustumCulled=false;mesh.visible=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(mesh);}
 }
 draw(dt,enabled,soaking,y){
  if(!enabled){this.strength=0;this.bubbles.visible=false;this.rings.visible=false;return;}
  this.time+=dt;this.strength=THREE.MathUtils.clamp(this.strength+(soaking?dt*7:-dt*1.7),0,1);
  this.bubbles.visible=this.rings.visible=this.strength>.001;if(!this.bubbles.visible)return;
  this.bubbles.material.opacity=.56*this.strength;this.rings.material.opacity=.55*this.strength;
  const radii=boundaryAt(this.profile,y),n=radii.length,d=this.dummy;
  for(let i=0;i<this.count;i++){
   const angle=i*2.399963,wrapped=(angle%(Math.PI*2))/(Math.PI*2)*n,lo=Math.floor(wrapped),edge=THREE.MathUtils.lerp(radii[lo],radii[(lo+1)%n],wrapped-lo);
   const radius=edge*(.14+.67*Math.sqrt((i+.5)/this.count)),life=(this.time*(1.1+(i%5)*.1)+i*.618)%1;
   const size=(.005+(i%6)*.0016)*Math.sin(Math.PI*life)*this.strength;
   const x=Math.cos(angle)*radius+Math.sin(this.time*2+i)*.002,z=Math.sin(angle)*radius+Math.cos(this.time*1.6+i)*.002;
   d.rotation.set(0,0,0);d.position.set(x,y+.002+life*.015,z);d.scale.set(size,size*.82,size);d.updateMatrix();this.bubbles.setMatrixAt(i,d.matrix);
   // A small expanding ripple marks each bubble as it reaches the surface.
   const burst=life>.65?Math.sin((life-.65)/.35*Math.PI):0,ringSize=(.004+(i%6)*.0016)*(1+life)*burst*this.strength;
   d.rotation.set(-Math.PI/2,0,0);d.position.set(x,y+.0018,z);d.scale.setScalar(ringSize);d.updateMatrix();this.rings.setMatrixAt(i,d.matrix);
  }
  this.bubbles.instanceMatrix.needsUpdate=true;this.rings.instanceMatrix.needsUpdate=true;
 }
}

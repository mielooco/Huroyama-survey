import * as THREE from './vendor/three.module.js';
export function outletStrength(sealed,storedWater){return sealed?0:.3+.7*Math.sqrt(Math.max(0,storedWater));}
export class DetailOutflow extends THREE.Group{
 constructor(z){
  super();this.z=z;this.material=new THREE.MeshBasicMaterial({color:0x55becb,transparent:true,opacity:.2,depthWrite:false});
  for(const sign of [-1,1]){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(sign*.013,-.299,z),new THREE.Vector3(sign*.01,-.314,z),new THREE.Vector3(0,-.329,z)]);this.add(new THREE.Mesh(new THREE.TubeGeometry(curve,24,.0018,7,false),this.material));}
  const jet=new THREE.Mesh(new THREE.CylinderGeometry(.0036,.0024,.104,12,1,true),this.material);jet.position.set(0,-.381,z);this.add(jet);
  this.drops=new THREE.InstancedMesh(new THREE.SphereGeometry(.0012,8,6),new THREE.MeshBasicMaterial({color:0x269dbd,transparent:true,opacity:.7}),24);this.drops.frustumCulled=false;this.add(this.drops);this.dummy=new THREE.Object3D();
 }
 draw(time,sealed,storedWater,water){
  const strength=outletStrength(sealed,storedWater);this.visible=water&&strength>0;this.material.opacity=.12+.22*strength;
  for(let i=0;i<24;i++){const f=(time*.75+i/24)%1;this.dummy.position.set(Math.sin(i*2.4)*.0015,-.325-.112*f,this.z);this.dummy.scale.set(.65,1.7+.8*strength,.65);this.dummy.updateMatrix();this.drops.setMatrixAt(i,this.dummy.matrix);}this.drops.instanceMatrix.needsUpdate=true;
 }
}

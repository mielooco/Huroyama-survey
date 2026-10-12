import * as THREE from './vendor/three.module.js';
export const FOOD_COUNT=96;
export const FOOD_INTERVAL=.10;
export const FOOD_FALL_TIME=.85;
const random=(n,seed)=>{const v=Math.sin(n*127.1+seed*311.7)*43758.5453;return v-Math.floor(v);};
export function foodSize(index,seed=17){return .0014+random(index+200,seed)*.0018;}
// Staggered pieces fall quickly, then stay in eight shallow layers in the basket.
export function foodPosition(index,time,seed=17){
 const age=time-index*FOOD_INTERVAL,sign=index%2?1:-1;
 const x=sign*(.018+random(index+2,seed)*.012);
 const endY=-.255+Math.floor(index/12)*.0042+random(index+40,seed)*.0015;
 const t=THREE.MathUtils.clamp(age/FOOD_FALL_TIME,0,1);
 return {visible:age>=0,x:x+Math.sin(t*Math.PI)*.001*sign,y:THREE.MathUtils.lerp(-.185,endY,t),z:.001+random(index+90,seed)*.002,settled:t===1};
}
export class CollectionEffect extends THREE.Group{
 constructor(z){super();this.z=z;this.time=0;this.seed=17;this.items=[];const geometry=new THREE.DodecahedronGeometry(1,0),colors=['#eda04c','#88b849','#d4ce6b','#d9743a'];
 this.materials=colors.map(color=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.12,roughness:.85,metalness:0}));
 for(let i=0;i<FOOD_COUNT;i++){const mesh=new THREE.Mesh(geometry,this.materials[i%4]);mesh.rotation.set(i*.7,i*.9,i*1.4);this.items.push(mesh);this.add(mesh);}this.resizePieces();this.visible=false;
 }
 resizePieces(){this.items.forEach((mesh,i)=>{const size=foodSize(i,this.seed);mesh.scale.set(size*(.8+(i%3)*.15),size*(.75+(i%4)*.1),size*.65);});}
 reset(){this.time=0;this.seed++;this.resizePieces();}
 draw(dt,active,paused){this.visible=active;if(!active)return;if(!paused)this.time+=dt;this.items.forEach((mesh,i)=>{const p=foodPosition(i,this.time,this.seed);mesh.visible=p.visible;mesh.position.set(p.x,p.y,this.z+p.z);if(!p.settled&&!paused)mesh.rotation.z+=dt*1.2;});}
}

import * as THREE from './vendor/three.module.js';
export class SparkleTiming{
 constructor(){this.phase='dirty';this.elapsed=1;}
 update(dt,active,phase){if(!active){this.phase=phase;this.elapsed=1;return 0;}if(phase==='done'&&this.phase!=='done')this.elapsed=0;else this.elapsed+=dt;this.phase=phase;return phase==='done'&&this.elapsed<.8?Math.sin(Math.PI*this.elapsed/.8):0;}
}
export class CleanSparkle{
 constructor(scene,model){this.timing=new SparkleTiming();const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d'),g=c.createRadialGradient(64,64,0,64,64,60);g.addColorStop(0,'#fffde9');g.addColorStop(.13,'#fff4cfee');g.addColorStop(1,'#fff4cf00');c.fillStyle=g;c.fillRect(0,0,128,128);c.fillStyle='#fffdf0';c.beginPath();c.moveTo(64,4);c.lineTo(71,54);c.lineTo(122,64);c.lineTo(71,72);c.lineTo(64,124);c.lineTo(56,72);c.lineTo(6,64);c.lineTo(56,54);c.closePath();c.fill();const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
 const sink=model.getObjectByName('sink'),box=new THREE.Box3().setFromObject(sink),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),ray=new THREE.Raycaster();model.updateMatrixWorld(true);
 this.stars=[[-.42,-.34],[.39,-.33],[-.36,.28],[.40,.25],[-.23,-.12],[.22,.10]].map(([x,z],i)=>{ray.set(new THREE.Vector3(center.x+x*size.x,box.max.y+.2,center.z+z*size.z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(sink,true)[0];const star=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,opacity:0,depthWrite:false,depthTest:true,toneMapped:false}));star.position.copy(hit?hit.point:new THREE.Vector3(center.x+x*size.x,box.max.y,center.z+z*size.z));star.position.y+=.006;star.scale.setScalar(.05);star.visible=false;scene.add(star);return star;});
 }
 draw(dt,active,phase){const strength=this.timing.update(dt,active,phase),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.stars.forEach((star,i)=>{star.visible=strength>0;star.material.opacity=strength*(reduced?.5:.92);star.scale.setScalar((.027+(i%3)*.008)*(reduced?1:.6+strength*.8));});}
}

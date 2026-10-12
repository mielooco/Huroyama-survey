import * as THREE from 'three';
import {advanceOdor} from './odor-logic.js';
export class OdorEffect{
 constructor(scene,outlet){
  this.group=new THREE.Group();this.group.visible=false;scene.add(this.group);this.outlet=outlet.clone();this.time=0;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'rgba(172,195,128,.65)');gradient.addColorStop(.35,'rgba(172,195,128,.4)');gradient.addColorStop(1,'rgba(172,195,128,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  this.puffs=Array.from({length:64},(_,i)=>{const upper=i>=24,life=upper?3.5+(i%5)*.3:2.2+(i%5)*.12;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthWrite:false,opacity:0,toneMapped:false}));this.group.add(sprite);return {sprite,upper,life,age:(upper?(i-24)/40:i/24)*life,fade:1,seed:i*2.399};});
 }
 reset(sealed){this.time=0;this.puffs.forEach((p,i)=>{p.age=(p.upper?(i-24)/40:i/24)*p.life;p.fade=p.upper&&sealed?0:1;});}
 draw(dt,sealed,active){
  this.group.visible=active;if(!active)return;this.time+=dt;
  for(const p of this.puffs){const opacity=advanceOdor(p,dt,p.upper&&sealed),f=Math.min(1,p.age/p.life),s=p.seed;
   const intake=Math.pow(f,1.5);
   const spread=p.upper?.002+f*f*.075:.0015+.035*Math.pow(1-intake,1.7);
   // Emit along the two visible sections of the horizontal opening, around the centre button.
   const slotX=p.upper?Math.sign(Math.sin(s))*(.018+Math.abs(Math.cos(s*1.7))*.026):0;
   const slotZ=p.upper?Math.sin(s*2.3)*.005:0;
   p.sprite.position.set(this.outlet.x+slotX+Math.sin(s+f*5+this.time*.35)*spread,p.upper?-.201+f*.29:this.outlet.y-.20+intake*.235,this.outlet.z+slotZ+Math.cos(s+f*4)*spread);
   const size=p.upper?.018+f*.09:.011+.052*(1-intake);p.sprite.scale.set(size*(p.upper?1.5:1),size*(p.upper?.55+f*.65:1.8),1);
   const intakeOpacity=Math.min(1,f/.16)*Math.min(1,(1-f)/.045);
   p.sprite.material.opacity=p.upper?opacity*.36:intakeOpacity*.64;p.sprite.material.rotation=Math.sin(s+this.time*.2)*.5;
  }
 }
}

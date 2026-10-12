import {Box3,Vector3} from './vendor/three.module.js';
// User-confirmed approximate basket stroke; model coordinates use metres.
export const BASKET_STROKE=.015;
export class BasketMotion{
 constructor(model){
  this.basket=model.getObjectByName('basket');
  this.head=model.getObjectByName('basket_head');
  if(!this.basket||!this.head)throw Error('Basket assembly missing');
  model.updateMatrixWorld(true);
  this.base=this.basket.position.clone();
  const parent=this.basket.parent,origin=this.basket.getWorldPosition(new Vector3());
  this.delta=parent.worldToLocal(origin.clone().add(new Vector3(0,-BASKET_STROKE,0))).sub(parent.worldToLocal(origin.clone()));
  const box=new Box3().setFromObject(this.head);this.pressOrigin=box.getCenter(new Vector3());this.pressOrigin.y=box.max.y+.0005;
  this.amount=0;
 }
 setAmount(amount){this.amount=Math.max(0,Math.min(1,amount));this.basket.position.copy(this.base).addScaledVector(this.delta,this.amount);this.basket.updateMatrixWorld(true);}
 update(sealed,dt){const target=sealed?1:0,next=this.amount+(target-this.amount)*(1-Math.exp(-10*dt));this.setAmount(Math.abs(next-target)<.001?target:next);}
 pressPoint(){return this.pressOrigin.clone().add(new Vector3(0,-BASKET_STROKE*this.amount,0));}
}

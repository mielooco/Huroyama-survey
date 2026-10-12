import {Raycaster,Vector3} from './vendor/three.module.js';
const ray=new Raycaster();
export function pressIsVisible(model,camera,point){
 const direction=point.clone().sub(camera.position),distance=direction.length();
 // A grazing or underside view does not show a usable horizontal press surface.
 if(distance===0||(camera.position.y-point.y)/distance<.18)return false;
 ray.set(camera.position,direction.normalize());ray.near=0;ray.far=Math.max(0,distance-.0008);
 return ray.intersectObject(model,true).length===0;
}

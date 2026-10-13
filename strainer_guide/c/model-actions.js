import {Vector3,Matrix4,Box3} from './vendor/three.module.js';

export const partNodes = {lid:'top_cover',basket:'basket',valve:'pop_up_valve',ring:'adapter_ring',cup:'filter_cup'};
export const explodeOffsets = {lid:.20,basket:.17,valve:.13,ring:.025,cup:0};

// CAD parents use different axes. Apply displacement along world Y, not local Y.
export function setExplosion(model, amount) {
  model.updateMatrixWorld(true);
  for (const [id,name] of Object.entries(partNodes)) {
    const node=model.getObjectByName(name);
    if(!node) continue;
    node.userData.assembledPosition ??= node.position.clone();
    node.position.copy(node.userData.assembledPosition);
    node.updateWorldMatrix(true,false);
    const target=node.getWorldPosition(new Vector3());
    // The basket's assembled baseline is 5 mm below the imported CAD position.
    target.y+=(id==='basket'?-.005:0)+explodeOffsets[id]*Math.max(0,Math.min(100,amount))/100;
    node.position.copy(node.parent.worldToLocal(target));
  }
  model.updateMatrixWorld(true);
}

export function pickPart(object) {
  for(let o=object;o;o=o.parent){
    const id=Object.keys(partNodes).find(id=>partNodes[id]===o.name);
    if(id)return id;
  }
  return null;
}

// Scale in world X/Z so CAD parent rotations cannot change the ring thickness.
export function widenAdapterRing(model) {
 const ring=model.getObjectByName(partNodes.ring);
 if(!ring||ring.userData.horizontalSizeAdjusted)return;
 model.updateMatrixWorld(true);
 const center=new Box3().setFromObject(ring).getCenter(new Vector3());
 const scaleAroundCenter=new Matrix4().makeTranslation(center.x,center.y,center.z)
  .multiply(new Matrix4().makeScale(1.01,1,1.01))
  .multiply(new Matrix4().makeTranslation(-center.x,-center.y,-center.z));
 const local=new Matrix4().copy(ring.parent.matrixWorld).invert()
  .multiply(scaleAroundCenter).multiply(ring.matrixWorld);
 local.decompose(ring.position,ring.quaternion,ring.scale);
 ring.userData.horizontalSizeAdjusted=true;
 model.updateMatrixWorld(true);
}

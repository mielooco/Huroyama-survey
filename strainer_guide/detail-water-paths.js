// Metres, in the installed model's world coordinates. The channel narrows
// before the cup floor: turn inward above it, then follow the outlet bore.
export const WATER_DROP_RADIUS = .0011;
export const WATER_DROP_SCALE = [.7, 1.4, .7];
const side = [[.026,-.182],[.028,-.224],[.043,-.243],[.0449,-.250],[.0445,-.266],[.039,-.274],[.032,-.277],[.018,-.282],[.015,-.286],[.014,-.300],[.012,-.325],[.008,-.365],[.006,-.400]];
const bottom = [[.021,-.182],[.024,-.233],[.026,-.260],[.030,-.269],[.030,-.275],[.025,-.278],[.016,-.282],[.013,-.287],[.013,-.300],[.010,-.325],[.005,-.365],[.002,-.400]];

export function createWaterCurves(THREE,z,collection=false){
 return [-1,1].flatMap(sign=>(collection?[side,bottom,[[.042,-.182],[.046,-.207],[.046,-.220],[.0455,-.235],[.0449,-.250],...side.slice(4)]]:[side,bottom]).map(points=>{
  const v=points.map(([x,y])=>new THREE.Vector3(sign*x,y,z-(y<=-.282&&y>=-.308?.005*Math.min((-.282-y)/.004,(y+.308)/.008,1):0)));
  const curve=new THREE.CurvePath();let from=v[0];
  // Each rounded corner stays in the convex hull of its three controls.
  // Unlike an unconstrained spline it cannot overshoot through the cup wall.
  for(let i=1;i<v.length-1;i++){
   const before=v[i].clone().lerp(v[i-1],.2),after=v[i].clone().lerp(v[i+1],.2);
   curve.add(new THREE.LineCurve3(from,before));
   curve.add(new THREE.QuadraticBezierCurve3(before,v[i],after));from=after;
  }
  curve.add(new THREE.LineCurve3(from,v.at(-1)));return curve;
 }));
}

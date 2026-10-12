// Normalized teaching timeline; these rates are not physical flow measurements.
export function advanceWater(level,mode,inflow,seconds,fillSeconds=8){
 const dt=Math.max(0,Math.min(seconds,.1));
 const next=mode==='seal'?level+(inflow?dt/fillSeconds:0):level+(inflow?(.035-level)*dt*1.8:-dt/6);
 return Math.min(1,Math.max(0,next));
}
export function waterHeight(level){return -.197+Math.max(0,Math.min(1,level))*.132;}
export function boundaryAt(profile,y){const levels=profile.levels;const f=Math.max(0,Math.min(levels.length-1,(y-levels[0].y)/(levels.at(-1).y-levels[0].y)*(levels.length-1)));const a=Math.floor(f),b=Math.min(a+1,levels.length-1);return levels[a].radii.map((r,i)=>r+(levels[b].radii[i]-r)*(f-a));}

export function hasOutflow(mode,inflow,level){return mode==='drain'&&(inflow||level>.001);}

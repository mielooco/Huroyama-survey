import {Vector3} from './vendor/three.module.js';
const v=(x,y,z)=>new Vector3(x,y,z);
export const cm=value=>Number((value*100).toFixed(1)).toString();
export function dimensionLayout(box,spec={}){
 const a=box.min,b=box.max,pad=.012,y=a.y;
 const corners=[v(a.x,a.y,a.z),v(b.x,a.y,a.z),v(b.x,a.y,b.z),v(a.x,a.y,b.z),v(a.x,b.y,a.z),v(b.x,b.y,a.z),v(b.x,b.y,b.z),v(a.x,b.y,b.z)];
 const edges=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].map(([i,j])=>[corners[i],corners[j]]);
 const axes=[
  {axis:'X',name:'長',value:spec.X??(b.x-a.x),color:'#125577',from:corners[3],to:corners[2]},
  {axis:'Z',name:'寬',value:spec.Z??(b.z-a.z),color:'#267968',from:corners[2],to:corners[1]},
  {axis:'Y',name:'高',value:b.y-a.y,color:'#AC541F',from:corners[3],to:corners[7]}
 ];
 const grid=[];
 for(let i=0;i<=6;i++){const x=a.x-pad+(b.x-a.x+2*pad)*i/6,z=a.z-pad+(b.z-a.z+2*pad)*i/6;grid.push([v(x,y,a.z-pad),v(x,y,b.z+pad)],[v(a.x-pad,y,z),v(b.x+pad,y,z)]);}
 return {edges,axes,grid};
}
export function renderDimensions(svg,box,camera,width,height,spec={}){
 const layout=dimensionLayout(box,spec),project=p=>{const q=p.clone().project(camera);return {x:(q.x+1)*width/2,y:(1-q.y)*height/2};};
 const line=(a,b,attrs='')=>{const p=project(a),q=project(b);return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" ${attrs}/>`;};
 let markup=`<g stroke="#A0C8E0" stroke-width=".7" opacity=".35">${layout.grid.map(([a,b])=>line(a,b)).join('')}</g><g stroke="#7D9CA9" stroke-width="1" stroke-dasharray="4 5" opacity=".5">${layout.edges.map(([a,b])=>line(a,b)).join('')}</g>`;
 for(const d of layout.axes){
  const p=project(d.from),q=project(d.to),mx=(p.x+q.x)/2,my=(p.y+q.y)/2;
  let angle=Math.atan2(q.y-p.y,q.x-p.x)*180/Math.PI;
  if(angle>90)angle-=180;if(angle < -90)angle+=180;
  markup+=`<text class="dimension-label" transform="translate(${mx} ${my}) rotate(${angle})" text-anchor="middle" dominant-baseline="central" fill="${d.color}" stroke="#EEF5FA" stroke-width="7" stroke-linejoin="round" paint-order="stroke" font-size="15" font-weight="600">${cm(d.value)} cm</text>`;
 }
 svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.innerHTML=markup;
}

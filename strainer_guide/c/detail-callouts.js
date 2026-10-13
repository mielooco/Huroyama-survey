import * as THREE from './vendor/three.module.js';
export const CALLOUTS=[
 {part:'top_cover',title:'濾網上蓋',note:'遮蔽下方菜渣',side:'left',row:.23,xy:[-.044,-.204]},
 {part:'filter_cup',title:'濾網杯體',note:'容納濾籃與水流',side:'left',row:.46,xy:[-.047,-.26]},
 {part:'drain_housing',title:'下方出口',note:'水流由此排出',side:'left',row:.76,xy:[-.014,-.388]},
 {part:'adapter_ring_body',title:'適配環',note:'貼合排水口',side:'right',row:.23,xy:[.052,-.216]},
 {part:'basket_body',title:'金屬渣籃',note:'攔留菜渣',side:'right',row:.40,xy:[.043,-.244]},
 {part:'stopper_seal',title:'止水閥',note:'止水開啟',side:'right',row:.61,xy:[.02,-.272]},
];
export function bindCallouts(model,caps){
 return CALLOUTS.map(def=>{const part=caps.parts.find(p=>p.name===def.part),mesh=model.getObjectByName(def.part);if(!part||!mesh)throw Error(`Missing callout part: ${def.part}`);
  let best=null,distance=Infinity;const target=new THREE.Vector3(...def.xy,caps.planeZ);
  for(let i=0;i<part.lines.length;i+=6){const a=new THREE.Vector3(...part.lines.slice(i,i+3)),b=new THREE.Vector3(...part.lines.slice(i+3,i+6)),v=b.clone().sub(a),t=THREE.MathUtils.clamp(target.clone().sub(a).dot(v)/v.lengthSq(),0,1),point=a.addScaledVector(v,t),d=point.distanceToSquared(target);if(d<distance){best=point;distance=d;}}
  return {...def,mesh,local:mesh.worldToLocal(best)};
 });
}
export class DetailCallouts{
 constructor(host,model,caps){
  this.host=host;this.bindings=bindCallouts(model,caps);const ns='http://www.w3.org/2000/svg';
  this.svg=document.createElementNS(ns,'svg');this.svg.classList.add('detail-leaders');this.svg.setAttribute('aria-hidden','true');this.svg.style.visibility='hidden';host.append(this.svg);
  for(const item of this.bindings){const group=document.createElementNS(ns,'g'),path=document.createElementNS(ns,'polyline'),dot=document.createElementNS(ns,'circle');dot.setAttribute('r','2.5');group.append(path,dot);this.svg.append(group);const label=document.createElement('div');label.className='detail-callout';label.hidden=true;label.dataset.side=item.side;const title=document.createElement('strong'),note=document.createElement('span');title.textContent=item.title;note.textContent=item.note;label.append(title,note);host.append(label);Object.assign(item,{group,path,dot,label,noteEl:note});}
 }
 draw(camera,sealed){
  const w=this.host.clientWidth,h=this.host.clientHeight,margin=w<600?10:22,labelWidth=w<600?80:112;
  if(!w||!h)return;this.svg.style.visibility='visible';this.svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
  for(const item of this.bindings){const p=item.mesh.localToWorld(item.local.clone()).project(camera),x=(p.x+1)*w/2,y=(1-p.y)*h/2,shown=p.z>=-1&&p.z<=1&&x>=0&&x<=w&&y>=50&&y<=h-44;
   item.group.style.display=shown?'':'none';if(!shown){item.label.hidden=true;continue;}
   const left=item.side==='left',rightIndex=this.bindings.filter(b=>b.side==='right').indexOf(item),rightInset=w>600?margin+54:margin,lx=left?margin:w-rightInset-labelWidth,preferredY=!left&&w<=600?Math.max(h*item.row,156+rightIndex*42):h*item.row,ly=Math.max(64,Math.min(h-84,preferredY));
   item.label.style.left=`${lx}px`;item.label.style.top=`${ly-18}px`;item.label.style.width=`${labelWidth}px`;item.label.hidden=false;
   const edge=left?lx+labelWidth:lx,elbow=left?edge+14:edge-14;
   item.path.setAttribute('points',`${x},${y} ${elbow},${ly} ${edge},${ly}`);item.dot.setAttribute('cx',x);item.dot.setAttribute('cy',y);
   if(item.part==='stopper_seal')item.noteEl.textContent=sealed?'止水關閉':'止水開啟';
  }
 }
}

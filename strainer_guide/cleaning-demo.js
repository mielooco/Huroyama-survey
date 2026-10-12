// This is a sped-up teaching sequence, not a chemical or efficacy simulation.
export class CleaningDemo {
 constructor(model){
  this.cleaner='citric';this.reset();
  this.active={value:0};this.amount={value:1};this.kind={value:0};
  model.getObjectByName('sink')?.traverse(mesh=>{
   if(!mesh.isMesh)return;
   mesh.material=mesh.material.clone();
   mesh.material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,{cleanActive:this.active,cleanAmount:this.amount,cleanKind:this.kind});
    shader.vertexShader='varying vec3 cleanPos; varying vec3 cleanNormal;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncleanPos=(modelMatrix*vec4(position,1.0)).xyz; cleanNormal=normalize(mat3(modelMatrix)*normal);');
    shader.fragmentShader=`uniform float cleanActive; uniform float cleanAmount; uniform float cleanKind;
     varying vec3 cleanPos; varying vec3 cleanNormal;
     float grimeHash(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,39.425)))*43758.5453);}
     float grimeNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(grimeHash(i),grimeHash(i+vec3(1,0,0)),f.x),mix(grimeHash(i+vec3(0,1,0)),grimeHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(grimeHash(i+vec3(0,0,1)),grimeHash(i+vec3(1,0,1)),f.x),mix(grimeHash(i+vec3(0,1,1)),grimeHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    `+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
     vec3 cn=normalize(cleanNormal); vec3 inward=normalize(vec3(-cleanPos.x,0.0,-cleanPos.z));
     float inner=max(smoothstep(.4,.8,cn.y),smoothstep(.2,.7,dot(cn,inward)));
     float band=smoothstep(-.207,-.19,cleanPos.y)*(1.0-smoothstep(-.10,-.070,cleanPos.y));
     float holes=smoothstep(.065,.085,length(cleanPos.xz-vec2(0.0,-.055)));
     float patches=smoothstep(.54,.81,grimeNoise(cleanPos*63.0)+.15*grimeNoise(cleanPos*220.0));
     float grime=patches*inner*band*holes*cleanActive*cleanAmount;
     diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.88,.88,.79),vec3(.27,.19,.10),cleanKind),grime*.70);
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=mix(outgoingLight,mix(vec3(.78,.78,.72),vec3(.12,.065,.025),cleanKind),grime*.80);\n#include <opaque_fragment>');
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.94,grime);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor*=1.0-grime*.78;');
   };
   mesh.material.customProgramCacheKey=()=> 'sink-cleaning-v1';mesh.material.needsUpdate=true;
  });
 }
 reset(){this.phase='dirty';this.progress=0;this.rinse=0;this.liquid=0;}
 select(cleaner){this.cleaner=cleaner;this.reset();}
 start(){this.phase='soaking';this.progress=0;}
 drain(){if(this.phase==='ready'){this.phase='rinsing';this.rinse=0;}else if(this.phase==='soaking')this.phase='interrupted';}
 update(dt,active,sealed,level){
  if(active&&this.phase==='soaking'&&sealed){this.progress=Math.min(1,this.progress+dt/2.5);if(this.progress===1)this.phase='ready';}
  if(active&&this.phase==='rinsing'){this.rinse=Math.min(1,this.rinse+dt/6);if(this.rinse===1&&level<=.001)this.phase='done';}
  this.active.value=active?1:0;this.kind.value=this.cleaner==='citric'?0:1;
  // Deposits dissolve into the water during the soak, before draining.
  this.amount.value=1-this.progress;
  this.liquid=this.phase==='done'?0:this.progress*(1-Math.max(0,(this.rinse-.8)/.2));
 }
}

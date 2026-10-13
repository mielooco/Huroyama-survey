// Shared appearance for the product viewer, installed view and cutaway.
// Fine procedural grain adds no image downloads; distant grain fades to avoid shimmer.
const steelParts = new Set(['sink','drain_housing','filter_cup','top_cover','basket_head','basket_screw','basket_body','spring','spring_hook','position_ring']);

export function surfaceMaterial(source, name, {section = false} = {}) {
 const material = source.clone();
 // The dedicated handle is grey-white polypropylene, not stainless steel.
 if (name === 'handle') {
  material.name = '灰白色 PP 塑膠';
  material.color.set('#d6d8d5');
  material.metalness = 0;
  material.roughness = .78;
  material.envMapIntensity = .55;
  return material;
 }
 if (!steelParts.has(name)) return material;
 const basin = name === 'sink';
 material.color.set(section ? '#bcc3c7' : '#b5bcc1');
 material.metalness = .96;
 material.roughness = basin ? .46 : .40;
 material.envMapIntensity = section ? 1.05 : .95;
 material.onBeforeCompile = shader => {
  shader.vertexShader = 'varying vec3 brushedPosition;\n' + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nbrushedPosition = position;');
  shader.fragmentShader = 'varying vec3 brushedPosition;\n' + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
   float grainAxis = brushedPosition.y * ${basin ? '0.35' : '1.0'} + brushedPosition.z * ${basin ? '1.0' : '0.35'};
   float grainPhase = grainAxis * 7000.0 + brushedPosition.x * 160.0;
   float grainFade = 1.0 - smoothstep(0.6, 2.4, fwidth(grainPhase));
   float brushedGrain = (sin(grainPhase) * 0.65 + sin(grainPhase * 2.17 + 1.4) * 0.35) * grainFade;
   diffuseColor.rgb *= 1.0 + brushedGrain * 0.025;
  `);
  shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor + brushedGrain * 0.045, 0.28, 0.65);');
 };
 material.customProgramCacheKey = () => basin ? 'brushed-sink-1' : 'brushed-product-1';
 return material;
}

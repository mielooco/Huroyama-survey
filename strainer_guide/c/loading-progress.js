// Keep byte sizes in sync if these versioned GLB assets are replaced.
const modelBytes={"filter": 3909472, "sink": 5109292, "handle": 309768};
export function modelProgress(name,loaded){
 const total=modelBytes[name];
 if(!total||!Number.isFinite(loaded)||loaded<=0)return '正在下載模型…';
 if(loaded>=total)return '下載完成，正在準備 3D 畫面…';
 return `正在下載模型 ${Math.min(99,Math.floor(loaded/total*100))}%`;
}

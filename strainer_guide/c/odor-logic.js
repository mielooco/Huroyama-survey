// One illustrative upper plume: stopping emission lets existing odor fade away.
export function advanceOdor(p,dt,sealed){
 p.age+=dt;
 if(sealed)p.fade=Math.max(0,p.fade-dt/.9);
 if(p.age>=p.life&&!sealed){p.age%=p.life;p.fade=1;}
 return Math.max(0,Math.sin(Math.PI*Math.min(1,p.age/p.life)))*p.fade;
}

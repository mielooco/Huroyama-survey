// Keep wheel scrolling native; capture before OrbitControls can cancel it.
// Touch pinch and explicit zoom controls remain enabled.
export function guardViewerWheel(canvas){
 const onWheel=event=>event.stopImmediatePropagation();
 canvas.addEventListener('wheel',onWheel,{capture:true,passive:true});
 return ()=>canvas.removeEventListener('wheel',onWheel,true);
}

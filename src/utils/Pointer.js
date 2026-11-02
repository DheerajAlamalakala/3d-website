import * as THREE from "three";
export default class Pointer {
  constructor(camera) {
    this.camera=camera; this.ndc=new THREE.Vector2(); this.world=new THREE.Vector3(99,99,0); this.target=this.world.clone();
    this.strength=0; this.active=false; this.ray=new THREE.Raycaster(); this.plane=new THREE.Plane(new THREE.Vector3(0,0,1),0); this.hit=new THREE.Vector3();
    this.onMove=this.onMove.bind(this); this.onLeave=()=>this.active=false;
    window.addEventListener("pointermove",this.onMove,{passive:true}); window.addEventListener("pointerleave",this.onLeave);
  }
  onMove(e) { this.ndc.set(e.clientX/window.innerWidth*2-1,-(e.clientY/window.innerHeight)*2+1); this.active=true; }
  update(delta) {
    if(this.active){this.ray.setFromCamera(this.ndc,this.camera);if(this.ray.ray.intersectPlane(this.plane,this.hit))this.target.copy(this.hit);}
    this.world.lerp(this.target,1-Math.exp(-6*delta));
    this.strength+=( (this.active?1:0)-this.strength )*(1-Math.exp(-3*delta));
  }
  dispose(){window.removeEventListener("pointermove",this.onMove);window.removeEventListener("pointerleave",this.onLeave);}
}
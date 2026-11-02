import * as THREE from "three";

// Tracks the mouse/touch and converts it to a 3D point on the z=0 plane.
// "Eased" means it chases the real pointer smoothly instead of snapping,
// which is a big part of what makes interactive sites feel fluid.
export default class Pointer {
  constructor(camera) {
    this.camera = camera;
    this.ndc = new THREE.Vector2(0, 0);       // normalized device coords: -1..1
    this.world = new THREE.Vector3(99, 99, 0); // eased world position (starts far away)
    this.target = new THREE.Vector3(99, 99, 0);
    this.strength = 0;                         // eased 0..1, fades in when active
    this.active = false;
    this.ray = new THREE.Raycaster();
    this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.hit = new THREE.Vector3();

    this.onMove = this.onMove.bind(this);
    this.onLeave = () => (this.active = false);
    window.addEventListener("pointermove", this.onMove, { passive: true });
    window.addEventListener("pointerleave", this.onLeave);
  }

  onMove(e) {
    this.ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    this.active = true;
  }

  update(delta) {
    if (this.active) {
      // Cast a ray from the camera through the mouse and find where it hits z=0.
      this.ray.setFromCamera(this.ndc, this.camera);
      if (this.ray.ray.intersectPlane(this.plane, this.hit)) this.target.copy(this.hit);
    }
    // Frame-rate independent easing: 1 - exp(-k * dt)
    const k = 1 - Math.exp(-6 * delta);
    this.world.lerp(this.target, k);
    this.strength += ((this.active ? 1 : 0) - this.strength) * (1 - Math.exp(-3 * delta));
  }

  dispose() {
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerleave", this.onLeave);
  }
}

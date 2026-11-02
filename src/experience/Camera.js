import * as THREE from "three";

export default class Camera {
  constructor() {
    this.instance = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.instance.position.set(0, 0, 9);
    this.look = new THREE.Vector3(0, 0, 0);
    this.baseZ = 9;
    this.resize();
  }

  resize() {
    this.instance.aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.instance.updateProjectionMatrix();
    // Portrait screens are narrow: pull the camera back so the whole form still fits.
    const a = this.instance.aspect;
    this.baseZ = a < 1 ? Math.min(9 + (1 / a - 1) * 3.2, 17) : 9;
  }

  // Camera drifts with the mouse (parallax) and dollies in/out with scroll.
  update(delta, pointer, scroll, intro = 1) {
    const targetX = pointer.ndc.x * 0.6;
    const targetY = pointer.ndc.y * 0.4;
    const targetZ = this.baseZ - Math.sin(scroll.smooth * Math.PI) * 2.5 + (1 - intro) * 4; // starts far back, glides in
    const k = 1 - Math.exp(-2.5 * delta);
    this.instance.position.x += (targetX - this.instance.position.x) * k;
    this.instance.position.y += (targetY - this.instance.position.y) * k;
    this.instance.position.z += (targetZ - this.instance.position.z) * k;
    this.instance.lookAt(this.look);
  }
}

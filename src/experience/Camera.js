import * as THREE from "three";

export default class Camera {
  constructor() {
    this.instance = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.instance.position.set(0, 0, 9);
    this.look = new THREE.Vector3(0, 0, 0);
    this.resize();
  }

  resize() {
    this.instance.aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.instance.updateProjectionMatrix();
  }

  update(delta, pointer, scroll) {
    const targetX = pointer.ndc.x * 0.6;
    const targetY = pointer.ndc.y * 0.4;
    const targetZ = 9 - Math.sin(scroll.smooth * Math.PI) * 2.5;
    const k = 1 - Math.exp(-2.5 * delta);
    this.instance.position.x += (targetX - this.instance.position.x) * k;
    this.instance.position.y += (targetY - this.instance.position.y) * k;
    this.instance.position.z += (targetZ - this.instance.position.z) * k;
    this.instance.lookAt(this.look);
  }
}
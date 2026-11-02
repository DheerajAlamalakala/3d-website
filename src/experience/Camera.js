import * as THREE from "three";

export default class Camera {
  constructor() {
    this.instance = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.instance.position.set(0, 0, 8);
    this.instance.lookAt(0, 0, 0);
    this.resize();
  }

  resize() {
    this.instance.aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.instance.updateProjectionMatrix();
  }

  update() {
    // Camera choreography will be connected to Lenis scroll in a later step.
  }
}
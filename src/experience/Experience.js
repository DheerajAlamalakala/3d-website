import * as THREE from "three";
import Renderer from "./Renderer.js";
import Camera from "./Camera.js";

export default class Experience {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050609);
    this.renderer = new Renderer(canvas);
    this.camera = new Camera();
    this.clock = new THREE.Clock();
    this.running = true;

    // A restrained lighting rig confirms color management and scene setup.
    this.scene.add(new THREE.AmbientLight(0x78909b, 0.45));
    const key = new THREE.PointLight(0x55ddeb, 18, 20);
    key.position.set(2, 2, 4);
    this.scene.add(key);

    this.onResize = this.onResize.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
    window.addEventListener("resize", this.onResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    this.onResize();
    this.frame = this.frame.bind(this);
    this.raf = requestAnimationFrame(this.frame);
  }

  frame() {
    if (!this.running) return;
    const delta = Math.min(this.clock.getDelta(), 0.05);
    this.camera.update(delta);
    this.renderer.render(this.scene, this.camera.instance);
    this.raf = requestAnimationFrame(this.frame);
  }

  onResize() {
    this.renderer.resize();
    this.camera.resize();
  }

  onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
      this.clock.stop();
    } else if (this.running) {
      this.clock.start();
      this.raf = requestAnimationFrame(this.frame);
    }
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    this.renderer.dispose();
  }
}
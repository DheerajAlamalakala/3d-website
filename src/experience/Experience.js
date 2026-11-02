import * as THREE from "three";
import Renderer from "./Renderer.js";
import Camera from "./Camera.js";
import Particles from "./Particles.js";
import Effects from "./Effects.js";
import Pointer from "../utils/Pointer.js";
import Scroll from "../utils/Scroll.js";

export default class Experience {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050609);
    this.renderer = new Renderer(canvas);
    this.camera = new Camera();
    this.pointer = new Pointer(this.camera.instance);
    this.scroll = new Scroll();
    this.clock = new THREE.Clock();
    this.running = true;

    const mobile = window.matchMedia("(max-width: 700px)").matches;
    this.particles = new Particles({
      count: mobile ? 35000 : 120000,
      pixelRatio: this.renderer.pixelRatio,
    });
    this.scene.add(this.particles.points);
    this.effects = mobile ? null : new Effects(this.renderer.instance, this.scene, this.camera.instance);

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
    const time = this.clock.elapsedTime;
    this.scroll.update(time, delta);
    this.pointer.update(delta);
    this.camera.update(delta, this.pointer, this.scroll);
    this.particles.update(time, this.pointer, this.scroll, this.renderer.pixelRatio);
    if (this.effects) {
      this.effects.update(this.scroll);
      this.effects.render(delta);
    } else {
      this.renderer.render(this.scene, this.camera.instance);
    }
    this.raf = requestAnimationFrame(this.frame);
  }

  onResize() {
    this.renderer.resize();
    this.camera.resize();
    if (this.effects) this.effects.resize(window.innerWidth, window.innerHeight);
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
    if (this.effects) this.effects.dispose();
    this.particles.dispose();
    this.pointer.dispose();
    this.scroll.dispose();
    this.renderer.dispose();
  }
}
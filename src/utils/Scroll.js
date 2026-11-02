import Lenis from "lenis";

export default class Scroll {
  constructor() {
    this.progress = 0;
    this.smooth = 0;
    this.velocity = 0;
    this.lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    this.lenis.on("scroll", ({ progress }) => (this.progress = progress || 0));
  }

  update(time, delta) {
    this.lenis.af(time * 1000);
    this.smooth += (this.progress - this.smooth) * (1 - Math.exp(-4 * delta));
    this.velocity += ((this.lenis.velocity || 0) - this.velocity) * (1 - Math.exp(-8 * delta));
  }

  dispose() {
    this.lenis.destroy();
  }
}
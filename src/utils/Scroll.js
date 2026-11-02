import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Lenis = smooth inertial scrolling. We expose the numbers visuals need:
//   progress  0..1 over the whole page
//   velocity  eased scroll speed (drives chromatic aberration, card bend)
//   morph     0..3 which particle shape we're on (see particles.vert.glsl)
export default class Scroll {
  constructor() {
    this.progress = 0;
    this.smooth = 0;
    this.velocity = 0;
    this.morph = 0;
    this.lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    // ScrollTrigger reads the window scroll position; tell it whenever Lenis moves.
    this.lenis.on("scroll", ({ progress }) => {
      this.progress = progress || 0;
      ScrollTrigger.update();
    });

    // Which section starts a new shape. Shape index per section anchor:
    // home = knot, work = orb, projects = orb (hold), studio = wave field, contact = knot.
    this.anchors = ["#home", "#work", "#projects", "#studio", "#contact"];
    this.values = [0, 1, 1, 2, 3];
    this.tops = [];
    this.measure();
  }

  // Page offsets of each anchor section. Re-run on resize and after fonts load.
  measure() {
    this.tops = this.anchors.map((sel) => {
      const el = document.querySelector(sel);
      return el ? el.getBoundingClientRect().top + window.scrollY : 0;
    });
  }

  morphTarget() {
    const y = this.lenis.scroll + window.innerHeight * 0.55;
    const { tops, values } = this;
    let i = 0;
    while (i < tops.length - 1 && y >= tops[i + 1]) i++;
    if (i >= tops.length - 1) return values[values.length - 1];
    const t = (y - tops[i]) / Math.max(1, tops[i + 1] - tops[i]);
    // Hold the current shape for the first half of a section, then morph.
    const k = Math.min(Math.max((t - 0.5) / 0.5, 0), 1);
    return values[i] + (values[i + 1] - values[i]) * (k * k * (3 - 2 * k));
  }

  update(time, delta) {
    this.lenis.raf(time * 1000);
    this.smooth += (this.progress - this.smooth) * (1 - Math.exp(-4 * delta));
    this.velocity += ((this.lenis.velocity || 0) - this.velocity) * (1 - Math.exp(-8 * delta));
    this.morph += (this.morphTarget() - this.morph) * (1 - Math.exp(-3 * delta));
  }

  dispose() {
    this.lenis.destroy();
  }
}

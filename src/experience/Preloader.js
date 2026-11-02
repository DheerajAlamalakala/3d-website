import gsap from "gsap";

// PRELOADER = counter + progress line, then a choreographed reveal.
// GSAP timelines let us sequence many animations with exact overlaps, which is
// how premium sites get that "everything flows into the next thing" feel.
export default class Preloader {
  constructor(experience) {
    this.experience = experience;
    this.el = document.querySelector(".preloader");
    this.countEl = document.getElementById("preloader-count");
    this.barEl = document.getElementById("preloader-bar");
    this.state = { value: 0 };

    // Lock scrolling until the intro is finished.
    experience.scroll.lenis.stop();
    window.scrollTo(0, 0);

    // Real readiness signals: fonts loaded + first WebGL frame drawn.
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const frameReady = new Promise((resolve) => {
      const check = () => (experience.ready ? resolve() : requestAnimationFrame(check));
      check();
    });

    // The counter takes at least ~2.2s so the moment is felt, then we wait for
    // the real signals before revealing, so nothing pops in half-loaded.
    const counter = new Promise((resolve) => {
      gsap.to(this.state, {
        value: 100,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: () => this.render(),
        onComplete: resolve,
      });
    });

    Promise.all([counter, fontsReady, frameReady]).then(() => this.reveal());
  }

  render() {
    const v = Math.round(this.state.value);
    this.countEl.textContent = String(v).padStart(3, "0");
    this.barEl.style.transform = `scaleX(${this.state.value / 100})`;
  }

  reveal() {
    const exp = this.experience;
    document.body.classList.remove("loading"); // makes the page content visible again

    const tl = gsap.timeline({
      onComplete: () => {
        this.el.remove();
        exp.scroll.lenis.start(); // unlock scrolling
      },
    });

    // 1. Counter exits upward, line fades.
    tl.to(".preloader-count, .preloader-top", { y: -40, opacity: 0, duration: 0.6, ease: "power3.in", stagger: 0.05 });
    tl.to(".preloader-line", { opacity: 0, duration: 0.3 }, "<");

    // 2. The black curtain wipes away upward, revealing the scene behind it.
    tl.to(this.el, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "power4.inOut" }, "-=0.1");

    // 3. At the same time, particles fly in and assemble (uIntro 0 -> 1).
    tl.to(exp.intro, { value: 1, duration: 3.2, ease: "power2.out" }, "<0.1");

    // 4. Page text rises in, staggered, overlapping the wipe.
    tl.from(".topbar > *", { y: -24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }, "-=2.4");
    tl.from(".hero-meta span, .hero-bottom > *", { y: 20, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.06 }, "<0.2");
    tl.from(".hero .eyebrow", { y: 20, opacity: 0, duration: 0.9, ease: "power3.out" }, "<0.1");
    tl.from(".hero h1", { y: 90, opacity: 0, duration: 1.4, ease: "power4.out" }, "<0.1");
  }
}

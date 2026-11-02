import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { splitChars } from "../utils/split.js";

gsap.registerPlugin(ScrollTrigger);

// Scroll-triggered text reveals. Each element starts hidden, then animates in
// once, the first time it scrolls into view.
export function initReveals() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.querySelectorAll(".chapter h2").forEach((h) => {
    const chars = splitChars(h);
    gsap.set(chars, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: h, start: "top 85%", once: true,
      onEnter: () => gsap.to(chars, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.02 }),
    });
  });

  document.querySelectorAll(".chapter .eyebrow, .chapter-copy, .contact-link").forEach((el) => {
    gsap.set(el, { y: 30, opacity: 0 });
    ScrollTrigger.create({
      trigger: el, start: "top 92%", once: true,
      onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }),
    });
  });
}

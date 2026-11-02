import gsap from "gsap";
import { PROJECTS } from "../data/projects.js";

// Controls opening/closing a project: dissolve transition + detail overlay.
export default class ProjectView {
  constructor(experience) {
    this.exp = experience;
    this.el = document.querySelector(".project-view");
    this.openIndex = null;
    this.busy = false;
    this.parts = this.el.querySelectorAll("[data-pv]");

    experience.ui.cards.onOpen = (i, origin) => this.open(i, origin);
    this.el.querySelector(".pv-back").addEventListener("click", () => this.close());
    this.onKey = (e) => { if (e.key === "Escape") this.close(); };
    window.addEventListener("keydown", this.onKey);
  }

  async open(i, origin) {
    if (this.busy || this.openIndex !== null) return;
    this.busy = true;
    const p = PROJECTS[i];
    this.exp.scroll.lenis.stop();
    this.el.querySelector(".pv-index").textContent = `${String(i + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}`;
    this.el.querySelector(".pv-title").textContent = p.title;
    this.el.querySelector(".pv-desc").textContent = p.desc;
    this.el.querySelector(".pv-meta").innerHTML = `<span>${p.year}</span><span>${p.role}</span><span>${p.tags}</span>`;

    await this.exp.ui.transition.open(this.exp.ui.cards.textures[i], origin);

    document.body.classList.add("project-open");
    this.el.classList.add("is-open");
    this.el.setAttribute("aria-hidden", "false");
    gsap.fromTo(this.parts, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: "power3.out" });
    this.openIndex = i;
    this.busy = false;
  }

  async close() {
    if (this.busy || this.openIndex === null) return;
    this.busy = true;
    await gsap.to(this.parts, { y: -20, opacity: 0, duration: 0.35, stagger: 0.03 }).then();
    this.el.classList.remove("is-open");
    this.el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-open"); // page text fades back in as the dissolve recedes
    await this.exp.ui.transition.close();
    this.exp.scroll.lenis.start();
    this.openIndex = null;
    this.busy = false;
  }

  dispose() {
    window.removeEventListener("keydown", this.onKey);
  }
}

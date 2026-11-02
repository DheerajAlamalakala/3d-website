import "./styles.css";
import Experience from "./experience/Experience.js";
import Preloader from "./experience/Preloader.js";
import ProjectView from "./experience/ProjectView.js";
import { initReveals } from "./experience/Reveals.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PROJECTS } from "./data/projects.js";

// Build the work cards from data (one source of truth for grid + detail view).
document.querySelector(".work-grid").innerHTML = PROJECTS.map((p, i) => `
  <article class="work-card" tabindex="0" role="button" data-cursor="view" aria-label="Open project ${p.title}">
    <div class="card-media"></div>
    <div class="card-meta"><span>${String(i + 1).padStart(2, "0")}</span><h3>${p.title}</h3><span>${p.tags}</span></div>
  </article>`).join("");

const canvas = document.querySelector(".webgl");
let experience;
try {
  experience = new Experience(canvas);
} catch (err) {
  // No WebGL available: show the plain page instead of a blank screen.
  console.error("WebGL unavailable:", err);
  document.body.classList.remove("loading");
  document.body.classList.add("no-webgl");
  document.querySelector(".preloader")?.remove();
}

if (experience) {
  window.formFieldExperience = experience; // handy for console debugging
  new Preloader(experience);
  const projectView = new ProjectView(experience);

  // Fonts change text size, so measure layout and set up reveals once they're ready.
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    initReveals();
    experience.scroll.measure();
    ScrollTrigger.refresh();
  });

  // Smooth anchor navigation through Lenis.
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      experience.scroll.lenis.scrollTo(target, { duration: 1.6 });
    });
  });

  if (import.meta.hot) {
    import.meta.hot.dispose(() => { projectView.dispose(); experience.dispose(); });
  }
}

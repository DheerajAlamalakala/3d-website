// Custom cursor: a small dot that follows instantly and a ring that trails behind.
// The lag between them is what makes it feel smooth and physical.
export default class Cursor {
  constructor() {
    this.enabled = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!this.enabled) return;
    this.dot = document.createElement("div");
    this.dot.className = "cursor-dot";
    this.ring = document.createElement("div");
    this.ring.className = "cursor-ring";
    this.ring.innerHTML = '<span class="cursor-ring-in"><b></b></span>';
    this.label = this.ring.querySelector("b");
    document.body.append(this.dot, this.ring);
    document.documentElement.classList.add("has-cursor");

    this.target = { x: innerWidth / 2, y: innerHeight / 2 };
    this.dotPos = { ...this.target };
    this.ringPos = { ...this.target };

    this.onMove = (e) => { this.target.x = e.clientX; this.target.y = e.clientY; };
    // Event delegation: one listener decides the cursor state for the whole page.
    this.onOver = (e) => {
      const el = e.target.closest("[data-cursor], a, button");
      const kind = !el ? "" : el.dataset.cursor || "link";
      this.ring.className = "cursor-ring" + (kind ? ` is-${kind}` : "");
      this.label.textContent = kind === "view" ? "VIEW" : "";
    };
    window.addEventListener("pointermove", this.onMove, { passive: true });
    document.addEventListener("pointerover", this.onOver);
  }

  update(delta) {
    if (!this.enabled) return;
    const kDot = 1 - Math.exp(-30 * delta), kRing = 1 - Math.exp(-11 * delta);
    this.dotPos.x += (this.target.x - this.dotPos.x) * kDot;
    this.dotPos.y += (this.target.y - this.dotPos.y) * kDot;
    this.ringPos.x += (this.target.x - this.ringPos.x) * kRing;
    this.ringPos.y += (this.target.y - this.ringPos.y) * kRing;
    this.dot.style.transform = `translate3d(${this.dotPos.x}px,${this.dotPos.y}px,0)`;
    this.ring.style.transform = `translate3d(${this.ringPos.x}px,${this.ringPos.y}px,0)`;
  }

  dispose() {
    if (!this.enabled) return;
    window.removeEventListener("pointermove", this.onMove);
    document.removeEventListener("pointerover", this.onOver);
    this.dot.remove(); this.ring.remove();
    document.documentElement.classList.remove("has-cursor");
  }
}

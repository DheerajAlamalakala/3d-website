import * as THREE from "three";
import Cards from "./Cards.js";
import Transition from "./Transition.js";

// A second scene drawn AFTER post-processing, with a pixel-space orthographic
// camera (1 unit = 1 CSS pixel). Cards and the page transition live here so
// bloom and film grain don't wash out the artwork.
export default class UILayer {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1000, 1000);
    this.cards = new Cards(this.scene);
    this.transition = new Transition(this.scene);
  }

  resize(w, h) {
    Object.assign(this.camera, { left: -w / 2, right: w / 2, top: h / 2, bottom: -h / 2 });
    this.camera.updateProjectionMatrix();
    this.transition.resize(w, h);
  }

  update(time, delta, velocity) {
    this.cards.update(time, delta, velocity);
    this.transition.update(time);
  }

  render(renderer) {
    renderer.autoClear = false;   // keep what's already on screen
    renderer.clearDepth();
    renderer.render(this.scene, this.camera);
    renderer.autoClear = true;
  }

  dispose() {
    this.cards.dispose();
    this.transition.dispose();
  }
}

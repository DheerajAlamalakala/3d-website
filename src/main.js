import "./styles.css";
import Experience from "./experience/Experience.js";

const canvas = document.querySelector(".webgl");
const experience = new Experience(canvas);

// Keep the experience reachable for browser-console learning/debugging.
window.formFieldExperience = experience;

if (import.meta.hot) {
  import.meta.hot.dispose(() => experience.dispose());
}
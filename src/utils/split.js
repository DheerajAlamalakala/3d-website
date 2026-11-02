// Splits an element's text into words and characters so each can be animated.
// Words are wrapped in overflow:hidden masks, so characters slide up from below
// a clean invisible line, the classic "text reveal" look.
export function splitChars(el) {
  const label = el.textContent.replace(/\s+/g, " ").trim();
  const nodes = Array.from(el.childNodes);
  el.innerHTML = "";
  el.setAttribute("aria-label", label); // screen readers read the real text
  const chars = [];

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach((token) => {
        if (!token) return;
        if (/^\s+$/.test(token)) return el.appendChild(document.createTextNode(" "));
        const word = document.createElement("span");
        word.className = "word"; word.setAttribute("aria-hidden", "true");
        for (const ch of token) {
          const c = document.createElement("span");
          c.className = "char"; c.textContent = ch;
          word.appendChild(c); chars.push(c);
        }
        el.appendChild(word);
      });
    } else {
      el.appendChild(node); // keep <br> and other elements as they are
    }
  }
  return chars;
}

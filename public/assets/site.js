// Runs on load. Everything here responds to something the visitor does:
// the theme button, the folding rows, the pointer over the name, scrolling
// past a section. Nothing animates on its own.

const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

/* Theme */
const toggle = document.getElementById("theme-toggle");

function reflectTheme() {
  const dark = root.classList.contains("dark");
  toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  toggle.querySelector(".icon-moon").hidden = dark;
  toggle.querySelector(".icon-sun").hidden = !dark;
}

if (toggle) {
  toggle.addEventListener("click", () => {
    if (!reduceMotion.matches) {
      root.classList.add("theming");
      setTimeout(() => root.classList.remove("theming"), 300);
    }
    const dark = root.classList.toggle("dark");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
    reflectTheme();
  });

  // Follow the system if the visitor has never chosen explicitly.
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem("theme"); } catch (err) {}
    if (saved) return;
    root.classList.toggle("dark", e.matches);
    reflectTheme();
  });

  reflectTheme();
}

/* Folding rows: animated open/close for browsers without CSS interpolate-size */
const nativeFold = CSS.supports("interpolate-size: allow-keywords");

function animateDetails(details, summary) {
  if (nativeFold || reduceMotion.matches) return; // CSS handles it, or no motion wanted
  summary.addEventListener("click", (e) => {
    e.preventDefault();
    if (details.dataset.animating) return;
    details.dataset.animating = "1";
    const body = details.querySelector(".entry-body");
    const from = details.offsetHeight;
    if (details.open) {
      const to = summary.offsetHeight;
      details.style.overflow = "clip";
      const a = details.animate({ height: [`${from}px`, `${to}px`] }, { duration: 220, easing: "ease" });
      a.onfinish = () => {
        details.open = false;
        details.style.overflow = "";
        details.style.height = "";
        delete details.dataset.animating;
      };
    } else {
      details.open = true;
      const to = summary.offsetHeight + body.offsetHeight;
      details.style.overflow = "clip";
      const a = details.animate({ height: [`${from}px`, `${to}px`] }, { duration: 260, easing: "ease" });
      a.onfinish = () => {
        details.style.overflow = "";
        details.style.height = "";
        delete details.dataset.animating;
      };
    }
  });
}

for (const details of document.querySelectorAll("details.entry")) {
  animateDetails(details, details.querySelector("summary"));
}

/* Expand all / collapse all per section */
for (const head of document.querySelectorAll(".section-head")) {
  const section = head.closest("section");
  const entries = section.querySelectorAll("details.entry");
  if (!entries.length) continue;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "expand-all";
  const label = () => {
    const allOpen = [...entries].every((d) => d.open);
    button.textContent = allOpen ? "Collapse all" : "Expand all";
  };
  button.addEventListener("click", () => {
    const allOpen = [...entries].every((d) => d.open);
    for (const d of entries) d.open = !allOpen;
    label();
  });
  section.addEventListener("toggle", label, true);
  label();
  head.append(button);
}

/* The name: letters near the pointer lose weight, so the cursor "presses" the type */
const name = document.getElementById("name");
if (name && matchMedia("(pointer: fine)").matches && !reduceMotion.matches) {
  const text = name.textContent;
  name.setAttribute("aria-label", text);
  name.textContent = "";
  const letters = [];
  for (const ch of text) {
    if (ch === " ") {
      name.append(" ");
      continue;
    }
    const span = document.createElement("span");
    span.className = "letter";
    span.textContent = ch;
    span.setAttribute("aria-hidden", "true");
    name.append(span);
    letters.push(span);
  }
  const hero = name.closest(".hero");
  const RADIUS = 160;
  hero.addEventListener("pointermove", (e) => {
    for (const span of letters) {
      const r = span.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy);
      const t = Math.max(0, 1 - d / RADIUS);
      span.style.setProperty("--w", String(Math.round(700 - 400 * t * t)));
    }
  });
  hero.addEventListener("pointerleave", () => {
    for (const span of letters) span.style.removeProperty("--w");
  });
}

/* Current section in the nav */
const navLinks = [...document.querySelectorAll(".site-header nav a[href^='#']")];
if (navLinks.length && "IntersectionObserver" in window) {
  const byId = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));
  const visible = new Map();
  const lastId = navLinks[navLinks.length - 1].getAttribute("href").slice(1);
  const mark = (best) => {
    for (const [id, a] of byId) {
      if (id === best) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
  };
  const pick = () => {
    // At the very bottom the last section is short, so call it current anyway.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) return mark(lastId);
    let best = null;
    for (const [id, ratio] of visible) if (ratio > 0 && (!best || ratio > visible.get(best))) best = id;
    mark(best);
  };
  const observer = new IntersectionObserver((entries) => {
    for (const en of entries) visible.set(en.target.id, en.isIntersecting ? en.intersectionRatio : 0);
    pick();
  }, { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.25, 0.5, 1] });
  window.addEventListener("scroll", pick, { passive: true });
  for (const id of byId.keys()) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }
}

/* Chess loads only when asked for. */
const play = document.getElementById("chess-play");
if (play) {
  play.addEventListener("click", async () => {
    play.disabled = true;
    play.textContent = "Setting up…";
    try {
      const { mount } = await import("/assets/chess.js");
      mount(document.getElementById("chess-app"));
    } catch (e) {
      play.textContent = "The board didn't load. Try again?";
      play.disabled = false;
    }
  });
}

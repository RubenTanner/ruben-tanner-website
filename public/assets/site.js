// Theme switch and the chess loader. This is the only script that runs on load.

const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");

function reflectTheme() {
  const dark = root.classList.contains("dark");
  toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  toggle.querySelector(".icon-moon").hidden = dark;
  toggle.querySelector(".icon-sun").hidden = !dark;
}

if (toggle) {
  toggle.addEventListener("click", () => {
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

// Chess loads only when asked for.
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

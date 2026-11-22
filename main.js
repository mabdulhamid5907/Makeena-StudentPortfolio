/* main.js – behaviour shared by every page */
"use strict";

/** Show a short message at the bottom of the screen. */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;

  /* ---- Footer year ---- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Mobile navigation ---- */
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");
  function setMenu(open) {
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.textContent = open ? "✕" : "☰";
  }
  navToggle.addEventListener("click", () => setMenu(!navMenu.classList.contains("open")));
  navMenu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---- Dark / light theme (remembered) ---- */
  const themeBtn = document.getElementById("theme-toggle");
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
    try { localStorage.setItem("theme", theme); } catch (e) { /* storage unavailable */ }
  }
  applyTheme(root.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  themeBtn.addEventListener("click", () =>
    applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark"));

  /* ---- Time-based greeting (home page) ---- */
  const welcome = document.getElementById("welcome-msg");
  if (welcome) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    welcome.textContent = `${greeting}, and welcome to my corner of the web!`;
  }

  /* ---- Typing effect (home page) ---- */
  const typed = document.getElementById("typed");
  if (typed) {
    const words = JSON.parse(typed.dataset.words);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      typed.textContent = words[0];
    } else {
      let w = 0, c = 0, deleting = false;
      (function tick() {
        const word = words[w];
        typed.textContent = word.slice(0, c);
        let delay = deleting ? 35 : 75;
        if (!deleting && c === word.length) { deleting = true; delay = 1400; }
        else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
        c += deleting ? -1 : 1;
        setTimeout(tick, delay);
      })();
    }
  }

  /* ---- Scroll reveal, count-up numbers and skill bars ---- */
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / 1200, 1);
      el.textContent = (target * (1 - Math.pow(1 - t, 3))).toFixed(decimals);
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
  function activate(el) {
    el.classList.add("visible");
    el.querySelectorAll("[data-count]").forEach(countUp);
    el.querySelectorAll(".bar-fill[data-level]").forEach((bar) => { bar.style.width = bar.dataset.level + "%"; });
  }
  const targets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { activate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach(activate);
  }
});

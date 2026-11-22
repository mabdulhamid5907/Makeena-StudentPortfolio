/* projects.js – filter project cards by category */
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const chips = document.querySelectorAll(".filter-bar .chip");
  const cards = document.querySelectorAll(".project");
  const emptyMsg = document.getElementById("no-projects");

  function filterProjects(category) {
    let visible = 0;
    cards.forEach((card) => {
      const show = category === "all" || card.dataset.category === category;
      card.classList.toggle("hide", !show);
      if (show) visible++;
    });
    emptyMsg.hidden = visible > 0;
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      filterProjects(chip.dataset.filter);
    });
  });
});

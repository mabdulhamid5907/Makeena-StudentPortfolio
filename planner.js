/* planner.js – interactive academic planner
   Features: add, complete, delete, filter, progress, saved in localStorage */
"use strict";

const STORAGE_KEY = "academic-planner-tasks";

/** The single source of truth: an array of task objects. */
let tasks = [];
let currentFilter = "all";

/* ---------- Storage ---------- */
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) { /* ignore corrupt or unavailable storage */ }
  // First visit: start with a few examples so the planner isn't blank.
  const d = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  return [
    { id: 1, title: "Submit COS 106 lab project", course: "COS 106", due: d(3), priority: "high", done: false },
    { id: 2, title: "Revise HTML forms and tables", course: "COS 106", due: d(1), priority: "medium", done: false },
    { id: 3, title: "Read Chapter 2 of Intro to CS", course: "COS 101", due: d(-1), priority: "low", done: true },
  ];
}
function saveTasks() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (e) { /* ignore */ }
}

/* ---------- Task operations ---------- */
function addTask(title, course, due, priority) {
  tasks.unshift({ id: Date.now(), title, course, due, priority, done: false });
  saveTasks();
  render();
}
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) { task.done = !task.done; saveTasks(); render(); }
}
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}
function clearCompleted() {
  const count = tasks.filter((t) => t.done).length;
  if (!count) { showToast("No completed tasks to clear"); return; }
  tasks = tasks.filter((t) => !t.done);
  saveTasks();
  render();
  showToast(`Cleared ${count} completed task${count > 1 ? "s" : ""}`);
}

/* ---------- Rendering ---------- */
function formatDue(due) {
  if (!due) return null;
  const date = new Date(due + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((date - today) / 86400000);
  const label = date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  if (days < 0) return { text: `Due ${label} (${-days} day${days === -1 ? "" : "s"} overdue)`, overdue: true };
  if (days === 0) return { text: "Due today", overdue: false };
  if (days === 1) return { text: "Due tomorrow", overdue: false };
  return { text: `Due ${label}`, overdue: false };
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = `task ${task.priority}${task.done ? " done" : ""}`;
  li.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.setAttribute("aria-label", `Mark "${task.title}" as completed`);
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const info = document.createElement("div");
  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.title;                 // textContent: safe against HTML injection
  const meta = document.createElement("div");
  meta.className = "task-meta";
  const parts = [task.course, `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`];
  parts.forEach((p) => { const s = document.createElement("span"); s.textContent = p; meta.appendChild(s); });
  const due = formatDue(task.due);
  if (due) {
    const s = document.createElement("span");
    s.textContent = due.text;
    if (due.overdue && !task.done) s.className = "overdue";
    meta.appendChild(s);
  }
  info.append(title, meta);

  const del = document.createElement("button");
  del.type = "button";
  del.className = "del-btn";
  del.textContent = "🗑";
  del.setAttribute("aria-label", `Delete "${task.title}"`);
  del.addEventListener("click", () => {
    li.classList.add("removing");                 // play exit animation, then remove
    setTimeout(() => deleteTask(task.id), 280);
  });

  li.append(checkbox, info, del);
  return li;
}

function render() {
  const list = document.getElementById("task-list");
  const emptyState = document.getElementById("empty-state");

  const visible = tasks.filter((t) =>
    currentFilter === "all" ? true : currentFilter === "done" ? t.done : !t.done);

  list.replaceChildren(...visible.map(createTaskElement));

  emptyState.hidden = visible.length > 0;
  if (!visible.length) {
    document.getElementById("empty-text").textContent =
      !tasks.length ? "No tasks yet. Add your first one!" :
      currentFilter === "done" ? "Nothing completed yet. You've got this!" : "All caught up. 🎉";
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("count-total").textContent = `${total} task${total === 1 ? "" : "s"}`;
  document.getElementById("count-done").textContent = `${done} completed`;
  document.getElementById("count-left").textContent = `${total - done} remaining`;
  document.getElementById("progress-pct").textContent = pct + "%";
  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("progress-bar").setAttribute("aria-valuenow", pct);
}

/* ---------- Wiring ---------- */
document.addEventListener("DOMContentLoaded", () => {
  tasks = loadTasks();

  const form = document.getElementById("task-form");
  const titleInput = document.getElementById("task-title");
  const error = document.getElementById("task-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (!title) {
      error.textContent = "Please enter a task before adding it.";
      titleInput.parentElement.classList.add("invalid");
      titleInput.focus();
      return;
    }
    addTask(title, form.course.value, form.due.value, form.priority.value);
    form.reset();
    error.textContent = "";
    titleInput.parentElement.classList.remove("invalid");
    showToast("Task added ✓");
    titleInput.focus();
  });

  titleInput.addEventListener("input", () => {
    if (titleInput.value.trim()) {
      error.textContent = "";
      titleInput.parentElement.classList.remove("invalid");
    }
  });

  document.querySelectorAll(".filter-bar .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      currentFilter = chip.dataset.filter;
      document.querySelectorAll(".filter-bar .chip").forEach((c) => c.classList.toggle("active", c === chip));
      render();
    });
  });

  document.getElementById("clear-done").addEventListener("click", clearCompleted);
  render();
});

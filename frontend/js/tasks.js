/**
 * Task board: quick-add form, search and sorting, task list and the edit dialog.
 * Tasks are kept as Task models; the edit dialog is bound to a copy
 * of the model, so cancelling the dialog leaves the task unchanged.
 */
import { API } from './api.js';
import { Task } from './models/task.js';
import { bindForm } from './binding.js';
import { confirmDialog } from './dialogs.js';
import { describeDueDate, daysFromToday, formatDuration } from './dates.js';
import { focusOnTask } from './pomodoro.js';
import { showError, showSuccess } from './ui.js';

const ICONS = {
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
  delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>',
  focus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
};

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const PRIORITY_LABEL = { high: "High", medium: "Medium", low: "Low" };

let tasks = [];            // Task models loaded from the API
let searchQuery = "";      // text typed into the search box
let sortMode = "priority"; // "priority", "due" or "newest"
let editedTask = null;     // copy of the task open in the dialog
let dialogBinding = null;  // binding between the dialog form and editedTask

function findTask(id) {
  return tasks.find((task) => task.id === Number(id));
}

// ---------- Sorting and filtering ----------

/** Tasks without a due date go last when sorting by date. */
function dueKey(task) {
  return task.dueDate || "9999-12-31";
}

const COMPARATORS = {
  priority: (a, b) =>
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || dueKey(a).localeCompare(dueKey(b)) || b.id - a.id,
  due: (a, b) =>
    dueKey(a).localeCompare(dueKey(b)) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.id - a.id,
  newest: (a, b) => b.id - a.id,
};

function visibleTasks() {
  const query = searchQuery.trim().toLowerCase();
  return tasks
    .filter((task) => !query
      || task.title.toLowerCase().includes(query)
      || task.description.toLowerCase().includes(query))
    .sort(COMPARATORS[sortMode]);
}

function isOverdue(task) {
  return !task.completed && task.dueDate && daysFromToday(task.dueDate) < 0;
}

// ---------- Rendering ----------

function createIconButton(action, label, icon, extraClass = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `icon-btn ${extraClass}`.trim();
  button.dataset.action = action;
  button.setAttribute("aria-label", label);
  button.title = label;
  button.innerHTML = icon; // constant SVG markup, no user data
  return button;
}

function createChip(text, className, icon = "") {
  const chip = document.createElement("span");
  chip.className = `chip ${className}`;
  chip.innerHTML = icon; // constant SVG markup
  chip.append(document.createTextNode(text));
  return chip;
}

function renderTaskMeta(task) {
  const meta = document.createElement("div");
  meta.className = "task-meta";

  if (task.priority !== "medium") {
    meta.append(createChip(PRIORITY_LABEL[task.priority], `chip-priority-${task.priority}`));
  }
  if (task.dueDate) {
    const due = describeDueDate(task.dueDate);
    const state = task.completed ? "later" : due.state;
    meta.append(createChip(due.label, `chip-due-${state}`, ICONS.calendar));
  }
  if (task.focusSeconds > 0) {
    meta.append(createChip(`${formatDuration(task.focusSeconds)} focused`, "chip-focus", ICONS.clock));
  }
  return meta.childElementCount ? meta : null;
}

function renderTaskCard(task) {
  const card = document.createElement("article");
  card.className = `task-card priority-${task.priority}`;
  card.classList.toggle("is-completed", task.completed);
  card.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.dataset.action = "toggle";
  checkbox.setAttribute("aria-label", `Mark "${task.title}" as completed`);

  const body = document.createElement("div");
  body.className = "task-body";
  body.dataset.action = "edit";

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;
  body.append(title);

  if (task.description) {
    const description = document.createElement("p");
    description.className = "task-desc";
    description.textContent = task.description;
    body.append(description);
  }

  const meta = renderTaskMeta(task);
  if (meta) body.append(meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";
  if (!task.completed) {
    actions.append(createIconButton("focus", "Focus on this task", ICONS.focus));
  }
  actions.append(
    createIconButton("edit", "Edit task", ICONS.edit),
    createIconButton("delete", "Delete task", ICONS.delete, "danger"),
  );

  card.append(checkbox, body, actions);
  return card;
}

function renderSection(title, sectionTasks) {
  const section = document.createElement("section");
  section.className = "task-section";

  if (title) {
    const heading = document.createElement("h2");
    heading.className = "task-section-title";
    heading.textContent = title;
    section.append(heading);
  }

  const list = document.createElement("div");
  list.className = "task-list";
  sectionTasks.forEach((task) => list.append(renderTaskCard(task)));
  section.append(list);
  return section;
}

function renderSummary() {
  const active = tasks.filter((task) => !task.completed).length;
  const overdue = tasks.filter(isOverdue).length;
  const completed = tasks.length - active;
  const parts = [`${active} active`];
  if (overdue) parts.push(`${overdue} overdue`);
  parts.push(`${completed} completed`);
  document.getElementById("task-summary").textContent = tasks.length ? parts.join(" · ") : "";
}

function renderTasks() {
  const container = document.getElementById("task-list");
  const shown = visibleTasks();
  const active = shown.filter((task) => !task.completed);
  const completed = shown.filter((task) => task.completed);

  container.replaceChildren();
  if (active.length) {
    container.append(renderSection("", active));
  }
  if (completed.length) {
    container.append(renderSection(`Completed · ${completed.length}`, completed));
  }

  const empty = document.getElementById("task-empty");
  const noMatches = document.getElementById("task-no-matches");
  empty.classList.toggle("hidden", tasks.length > 0);
  noMatches.classList.toggle("hidden", tasks.length === 0 || shown.length > 0);
  document.getElementById("task-toolbar").classList.toggle("hidden", tasks.length === 0);
  renderSummary();
}

export async function loadData() {
  try {
    const data = await API.request("/tasks/");
    tasks = (data || []).map(Task.fromApi);
    renderTasks();
  } catch (error) {
    showError(error);
  }
}

// ---------- Actions ----------

async function addTask(event) {
  event.preventDefault();
  const form = event.target;
  const titleInput = document.getElementById("new-task-title");

  const task = new Task();
  try {
    task.title = titleInput.value;
    task.description = document.getElementById("new-task-desc").value;
    task.priority = document.getElementById("new-task-priority").value;
    task.dueDate = document.getElementById("new-task-due").value;
  } catch (error) {
    showError(error);
    titleInput.focus();
    return;
  }

  try {
    await API.request("/tasks/", "POST", task.toPayload());
    form.reset();
    titleInput.focus();
    await loadData();
  } catch (error) {
    showError(error);
  }
}

async function toggleTask(task, checkbox) {
  const completed = checkbox.checked;
  try {
    await API.request(`/tasks/${task.id}`, "PUT", { completed });
    task.completed = completed;
    renderTasks();
    if (completed) showSuccess(`Completed: ${task.title}`);
  } catch (error) {
    checkbox.checked = !completed;
    showError(error);
  }
}

async function deleteTask(task) {
  const confirmed = await confirmDialog({
    title: "Delete task?",
    message: `"${task.title}" will be deleted permanently, together with its focus history.`,
    confirmText: "Delete",
    danger: true,
  });
  if (!confirmed) return;

  try {
    await API.request(`/tasks/${task.id}`, "DELETE");
    showSuccess("Task deleted.");
    await loadData();
  } catch (error) {
    showError(error);
  }
}

// ---------- Edit dialog ----------

function openEditDialog(task) {
  const dialog = document.getElementById("task-dialog");
  const form = document.getElementById("task-dialog-form");

  editedTask = task.clone();
  dialogBinding = bindForm(form, editedTask, ["title", "description", "priority", "dueDate", "completed"]);
  document.getElementById("task-dialog-error").textContent = "";
  document.getElementById("task-dialog-focus").textContent = task.focusSeconds
    ? `Focused on this task for ${formatDuration(task.focusSeconds)}.`
    : "";

  dialog.showModal();
  form.elements.namedItem("title").focus();
}

async function saveEditedTask(event) {
  event.preventDefault();
  const errorElement = document.getElementById("task-dialog-error");
  const saveButton = document.getElementById("task-dialog-save");
  errorElement.textContent = "";

  if (!dialogBinding.validate()) {
    dialogBinding.focusFirstInvalid();
    return;
  }

  saveButton.disabled = true;
  try {
    await API.request(`/tasks/${editedTask.id}`, "PUT", editedTask.toPayload());
    document.getElementById("task-dialog").close();
    showSuccess("Task updated.");
    await loadData();
  } catch (error) {
    // Errors stay inside the dialog, next to the form the user is editing.
    if (!error.handled) {
      errorElement.textContent = error.message;
    }
  } finally {
    saveButton.disabled = false;
  }
}

export function setupTasks() {
  document.getElementById("new-task-form").addEventListener("submit", addTask);

  document.getElementById("task-search").addEventListener("input", (event) => {
    searchQuery = event.target.value;
    renderTasks();
  });
  document.getElementById("task-sort").addEventListener("change", (event) => {
    sortMode = event.target.value;
    renderTasks();
  });

  // Focus time changes after Pomodoro sessions, so the list is refreshed on every visit.
  document.getElementById("nav-tasks-btn").addEventListener("click", loadData);

  const container = document.getElementById("task-list");
  container.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target || target.dataset.action === "toggle") return;
    const task = findTask(target.closest(".task-card").dataset.id);
    if (target.dataset.action === "edit") openEditDialog(task);
    if (target.dataset.action === "delete") deleteTask(task);
    if (target.dataset.action === "focus") focusOnTask(task.id);
  });
  container.addEventListener("change", (event) => {
    if (event.target.dataset.action === "toggle") {
      toggleTask(findTask(event.target.closest(".task-card").dataset.id), event.target);
    }
  });

  const dialog = document.getElementById("task-dialog");
  document.getElementById("task-dialog-form").addEventListener("submit", saveEditedTask);
  dialog.addEventListener("close", () => {
    dialogBinding?.unbind();
    dialogBinding = null;
    editedTask = null;
  });
}

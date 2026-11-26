/**
 * Task board: quick-add form, task list and the edit dialog.
 * Tasks are kept as Task models; the edit dialog is bound to a copy
 * of the model, so cancelling the dialog leaves the task unchanged.
 */
import { API } from './api.js';
import { Task } from './models/task.js';
import { bindForm } from './binding.js';
import { confirmDialog } from './dialogs.js';
import { showError, showSuccess } from './ui.js';

const EDIT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const DELETE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></svg>';

let tasks = [];            // Task models currently shown
let editedTask = null;     // copy of the task open in the dialog
let dialogBinding = null;  // binding between the dialog form and editedTask

function findTask(id) {
  return tasks.find((task) => task.id === Number(id));
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

function renderTaskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";
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

  const actions = document.createElement("div");
  actions.className = "task-actions";
  actions.append(
    createIconButton("edit", "Edit task", EDIT_ICON),
    createIconButton("delete", "Delete task", DELETE_ICON, "danger"),
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

function renderTasks() {
  const container = document.getElementById("task-list");
  const active = tasks.filter((task) => !task.completed);
  const completed = tasks.filter((task) => task.completed);

  container.replaceChildren();
  if (active.length) {
    container.append(renderSection("", active));
  }
  if (completed.length) {
    container.append(renderSection(`Completed · ${completed.length}`, completed));
  }

  document.getElementById("task-empty").classList.toggle("hidden", tasks.length > 0);
  document.getElementById("task-summary").textContent = tasks.length
    ? `${active.length} active · ${completed.length} completed`
    : "";
}

export async function loadData() {
  try {
    const data = await API.request("/tasks/");
    tasks = (data || []).map(Task.fromApi).sort((a, b) => a.id - b.id);
    renderTasks();
  } catch (error) {
    showError(error);
  }
}

// ---------- Actions ----------

async function addTask(event) {
  event.preventDefault();
  const titleInput = document.getElementById("new-task-title");
  const descriptionInput = document.getElementById("new-task-desc");

  const task = new Task();
  try {
    task.title = titleInput.value;
    task.description = descriptionInput.value;
  } catch (error) {
    showError(error);
    titleInput.focus();
    return;
  }

  try {
    await API.request("/tasks/", "POST", task.toPayload());
    titleInput.value = "";
    descriptionInput.value = "";
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
  } catch (error) {
    checkbox.checked = !completed;
    showError(error);
  }
}

async function deleteTask(task) {
  const confirmed = await confirmDialog({
    title: "Delete task?",
    message: `"${task.title}" will be deleted permanently.`,
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
  dialogBinding = bindForm(form, editedTask, ["title", "description", "completed"]);
  document.getElementById("task-dialog-error").textContent = "";

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

  const container = document.getElementById("task-list");
  container.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target || target.dataset.action === "toggle") return;
    const task = findTask(target.closest(".task-card").dataset.id);
    if (target.dataset.action === "edit") openEditDialog(task);
    if (target.dataset.action === "delete") deleteTask(task);
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

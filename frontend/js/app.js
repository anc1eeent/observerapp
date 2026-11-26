/**
 * Application entry point: wires up every page and decides whether
 * to show the login screen or the workspace.
 */
import { setupAuth, checkAuth } from "./auth.js";
import { setupTasks, loadData } from './tasks.js';
import { setupNavigation } from "./ui.js";
import { setupProfile, loadProfile } from "./profile.js";
import { setupPomodoro, pomodoroPageInit } from "./pomodoro.js";
import { setupDialogs } from "./dialogs.js";
import { showToast } from "./notify.js";
import { SESSION_EXPIRED_KEY } from "./api.js";

const authContainer = document.getElementById("auth-container");
const taskSection = document.getElementById("task-section");

function handleLoginSuccess() {
  authContainer.classList.add("hidden");
  taskSection.classList.remove("hidden");
  loadProfile();
  loadData();
}

setupDialogs();
setupProfile();
setupNavigation();
setupTasks();
setupAuth(handleLoginSuccess);
setupPomodoro();
pomodoroPageInit();

if (sessionStorage.getItem(SESSION_EXPIRED_KEY)) {
  sessionStorage.removeItem(SESSION_EXPIRED_KEY);
  showToast("Your session has expired. Please log in again.", "info");
}

if (checkAuth()) {
  handleLoginSuccess();
} else {
  authContainer.classList.remove("hidden");
  taskSection.classList.add("hidden");
}

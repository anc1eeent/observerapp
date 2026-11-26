/**
 * Shared UI helpers: navigation between pages, logout and messages
 * for the user.
 */
import { showToast } from './notify.js';

/** Shows a failed request to the user. ApiError messages are already readable. */
export function showError(error) {
  if (error.handled) {
    return;
  }
  showToast(error.message || "Something went wrong. Please try again.", "error");
}

/** Shows a short confirmation that an action succeeded. */
export function showSuccess(message) {
  showToast(message, "success");
}

export function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-item");
  const views = document.querySelectorAll(".spa-view");

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      navButtons.forEach((other) => other.classList.remove("active"));
      button.classList.add("active");

      views.forEach((view) => view.classList.add("hidden"));
      document.getElementById(button.dataset.target).classList.remove("hidden");
    });
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");
    location.reload();
  });
}

/**
 * Toast notifications: short messages in the corner of the screen
 * that disappear on their own.
 */
const DURATION_MS = { info: 4000, success: 3000, error: 6000 };

/** Shows a notification. type is "info", "success" or "error". */
export function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) {
    alert(message);
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  const text = document.createElement("span");
  text.className = "toast-message";
  text.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "toast-close";
  closeButton.setAttribute("aria-label", "Dismiss notification");
  closeButton.textContent = "×";

  toast.append(text, closeButton);
  container.append(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));

  let removed = false;
  const remove = () => {
    if (removed) return;
    removed = true;
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  };

  closeButton.addEventListener("click", remove);
  setTimeout(remove, DURATION_MS[type] ?? DURATION_MS.info);
}

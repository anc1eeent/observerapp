/**
 * Helpers for <dialog> windows: closing behaviour shared by all dialogs
 * and a reusable confirmation dialog.
 */

/** Every dialog closes with its [data-close] buttons and with a click on the backdrop. */
export function setupDialogs() {
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.querySelectorAll("[data-close]").forEach((button) => {
      button.addEventListener("click", () => dialog.close());
    });
    dialog.addEventListener("click", (event) => {
      // A click on the dialog element itself (not its content) is a click on the backdrop.
      if (event.target === dialog) {
        dialog.close();
      }
    });
  });
}

/**
 * Asks the user to confirm an action.
 * Resolves to true when the user confirms, false otherwise.
 */
export function confirmDialog({ title, message = "", confirmText = "Confirm", danger = false }) {
  const dialog = document.getElementById("confirm-dialog");
  const confirmButton = document.getElementById("confirm-ok");

  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-message").textContent = message;
  confirmButton.textContent = confirmText;
  confirmButton.classList.toggle("btn-danger", danger);
  confirmButton.classList.toggle("btn-primary", !danger);

  dialog.returnValue = "";
  dialog.showModal();
  confirmButton.focus();

  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "confirm"), { once: true });
  });
}

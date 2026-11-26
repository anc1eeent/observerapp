/**
 * Shared UI helpers: navigation between pages, logout and error messages.
 */

/** Shows a failed request to the user. ApiError messages are already readable. */
export function showError(error) {
  if (error.handled) {
    return;
  }
  alert(error.message || "Something went wrong. Please try again.");
}

export function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-item');
  const spaViews = document.querySelectorAll(".spa-view");

  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetId = btn.getAttribute("data-target");
      spaViews.forEach(view => view.classList.add("hidden"));

      document.getElementById(targetId).classList.remove("hidden");
    });
  });
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    location.reload();
  })
}

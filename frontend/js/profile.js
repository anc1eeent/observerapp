/**
 * Profile dialog: shows the current user and lets them change
 * the email, the avatar and the password.
 * The sidebar shows the same user, so it is updated together with the dialog.
 */
import { API } from "./api.js";
import { showSuccess } from "./ui.js";

const DEFAULT_AVATAR = "assets/profile/user.png";

/** Shows the user's avatar, falling back to the default one if the URL is missing or broken. */
function setAvatar(img, avatarUrl) {
  img.onerror = () => {
    img.onerror = null;
    img.src = DEFAULT_AVATAR;
  };
  img.src = avatarUrl || DEFAULT_AVATAR;
}

export function setupProfile() {
  const dialog = document.getElementById("profile-dialog");
  const updateProfileForm = document.getElementById("profile-update-form");
  const updatePasswordForm = document.getElementById("password-update-form");
  const errorProfile = document.getElementById("profile-error-msg");
  const errorPassword = document.getElementById("password-error-msg");

  document.getElementById("profile-trigger").addEventListener("click", () => {
    errorProfile.textContent = "";
    errorPassword.textContent = "";
    dialog.showModal();
  });

  updateProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorProfile.textContent = "";

    const emailValue = document.getElementById("update-email").value.trim();
    const avatarValue = document.getElementById("update-avatar").value.trim();

    const updateBody = {};
    if (emailValue) updateBody.email = emailValue;
    if (avatarValue) updateBody.avatar_url = avatarValue;
    if (!Object.keys(updateBody).length) {
      errorProfile.textContent = "Enter a new email or avatar URL.";
      return;
    }

    try {
      await API.request("/users/me/profile", "PATCH", updateBody);
      updateProfileForm.reset();
      await loadProfile();
      showSuccess("Profile updated.");
    } catch (error) {
      errorProfile.textContent = error.message;
    }
  });

  updatePasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorPassword.textContent = "";

    try {
      await API.request("/users/me/password", "PATCH", {
        old_password: document.getElementById("old-password").value,
        new_password: document.getElementById("new-password").value,
      });
      updatePasswordForm.reset();
      showSuccess("Password changed.");
    } catch (error) {
      errorPassword.textContent = error.message;
    }
  });
}

/** Loads the current user and fills the profile dialog and the sidebar. */
export async function loadProfile() {
  const profileUsername = document.getElementById("profile-username");
  const profileEmail = document.getElementById("profile-email");
  const sidebarUsername = document.getElementById("sidebar-username-display");
  try {
    const userData = await API.request("/users/me");
    if (userData) {
      profileUsername.textContent = userData.username;
      profileEmail.textContent = userData.email || "No email provided";
      sidebarUsername.textContent = userData.username;
      setAvatar(document.getElementById("profile-avatar-img"), userData.avatar_url);
      setAvatar(document.getElementById("sidebar-avatar-img"), userData.avatar_url);
    }
  } catch (error) {
    profileUsername.textContent = "Error loading";
    sidebarUsername.textContent = "";
  }
}

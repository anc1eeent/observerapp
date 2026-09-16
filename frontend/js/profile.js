import { API } from "./api.js";

export function setupProfile(){
  const profileTrigger = document.getElementById("profile-trigger");
  const profileOverlay = document.getElementById("profile-overlay");
  const closeProfileBtn = document.getElementById("close-profile-btn");
  const updateProfile = document.getElementById("profile-update-form");
  const updatePassword = document.getElementById("password-update-form");
  const errorProfile = document.getElementById("profile-error-msg");
  const errorPassword = document.getElementById("password-error-msg");

  profileTrigger.addEventListener("click", () => {
    profileOverlay.classList.remove("hidden");
  });

  closeProfileBtn.addEventListener("click", () => {
    profileOverlay.classList.add("hidden");
  });

  profileOverlay.addEventListener("click", (event) => {
    if (event.target === profileOverlay){
      profileOverlay.classList.add("hidden");
    }
  });

  updateProfile.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorProfile.textContent = "";
    
    const emailValue = document.getElementById("update-email").value.trim();
    const avatarValue = document.getElementById("update-avatar").value.trim();

    const updateBody = {};
    if (emailValue) updateBody.email = emailValue;
    if (avatarValue) updateBody.avatar_url = avatarValue;

    try{
      await API.request("/users/me/profile", "PATCH", updateBody);
      loadProfile();
      document.getElementById("update-email").value = "";
      document.getElementById("update-avatar").value = "";
    } catch (error){
      errorProfile.textContent = error.message;
    }
  });

  updatePassword.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorPassword.textContent = "";

    const old_password = document.getElementById("old-password").value;
    const new_password = document.getElementById("new-password").value;

    try {
      await API.request("/users/me/password", "PATCH", {
        old_password: old_password,
        new_password: new_password
      });
      document.getElementById("old-password").value = "";
      document.getElementById("new-password").value = "";
      alert("Password changed successfully!");
    } catch (error){
      errorPassword.textContent = error.message;
    }
  });
}

export async function loadProfile(){
  const profileUsername = document.getElementById("profile-username");
  const profileEmail = document.getElementById("profile-email");
  try{
    const userData = await API.request("/users/me");
  if(userData){
    profileUsername.textContent = userData.username;
    profileEmail.textContent = userData.email || "No email provided";
  }  
  }catch (error) {
    profileUsername.textContent = "Error loading";
  }
};
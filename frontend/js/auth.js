import { API, API_URL } from './api.js';

let isLoginMode = false;

export function setupAuth(onLoginSuccess) {
  const authForm = document.getElementById("register-form");
  const switchBtn = document.getElementById("switch-to-login"); 
  const formTitle = document.querySelector("#auth-form-section h2");
  const submitBtn = authForm.querySelector("button");
  switchBtn.addEventListener("click", (event) => {
  event.preventDefault();

  isLoginMode = !isLoginMode;

  if (isLoginMode) {
    formTitle.textContent = "Log In to Account";
    submitBtn.textContent = "Sign In";
    switchBtn.textContent = "Sign Up";
  } else {
    formTitle.textContent = "Sign Up Account";
    submitBtn.textContent = "Sign Up";
    switchBtn.textContent = "Log in";
  }
});

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usernameValue = document.getElementById("reg-username").value;
    const passwordValue = document.getElementById("reg-password").value;

    try{
    let response;
    if (isLoginMode) {   
      const formData = new URLSearchParams();
      formData.append("username", usernameValue)
      formData.append("password", passwordValue)
      response = await fetch(API_URL + "/users/login", {
          method: "POST",
          body: formData
        });
    } else {
      const route = "/users/register";
      response = await fetch(API_URL + route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameValue,
          password: passwordValue,
        }),
    })}
      const data = await response.json();

      if (response.ok) {
        if (isLoginMode) {
          localStorage.setItem("token", data.access_token);
         if (onLoginSuccess){
          onLoginSuccess();
         }
        } else {
          alert("Success! Now log in.");
          switchBtn.click();
        }
      } else {
        alert(data.detail);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

export function checkAuth() {
  return !!localStorage.getItem("token");
}

export function handleSessionExpired() {
  alert("Your session has expired. Please log in again.");
  localStorage.removeItem("token");
  window.location.reload();
}
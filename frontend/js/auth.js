/**
 * Login and registration forms.
 * Both forms use API.request, so errors are handled the same way
 * as in the rest of the application.
 */
import { API } from './api.js';
import { showError } from './ui.js';

function setAuthMode(isLogin) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  loginForm.classList.toggle("active", isLogin);
  registerForm.classList.toggle("active", !isLogin);
}

export function setupAuth(onLoginSuccess) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const switchToRegisterBtn = document.getElementById("switch-to-register");
  const switchToLoginBtn = document.getElementById("switch-to-login");

  switchToRegisterBtn.addEventListener("click", (event) => {
    event.preventDefault();
    setAuthMode(false);
  });

  switchToLoginBtn.addEventListener("click", (event) => {
    event.preventDefault();
    setAuthMode(true);
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
      const data = await API.request("/users/login", "POST", { username, password }, {
        form: true,
        expectUnauthorized: true,
      });
      localStorage.setItem("token", data.access_token);
      onLoginSuccess();
    } catch (error) {
      showError(error);
    }
  });

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;

    try {
      await API.request("/users/register", "POST", { username, password });
      alert("Success! Now log in.");
      setAuthMode(true);
    } catch (error) {
      showError(error);
    }
  });
}

export function checkAuth() {
  return !!localStorage.getItem("token");
}

import { API, API_URL } from './api.js';

let isLoginMode = true;

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

  switchToLoginBtn.addEventListener("click", (event) =>{
    event.preventDefault();
    setAuthMode(true);
  });

  loginForm.addEventListener("submit", async (event) =>{
    event.preventDefault();
    const usernameValue = document.getElementById("login-username").value;
    const passwordValue = document.getElementById("login-password").value;

    const formData = new URLSearchParams();
    formData.append("username", usernameValue);
    formData.append("password", passwordValue);
    try {
    const response = await fetch(API_URL + '/users/login', {
      method: "POST",
      body: formData
    });
    const data = await response.json();
    if (response.ok){
      localStorage.setItem("token", data.access_token);
      onLoginSuccess();
    }else{
      alert(data.detail || "Authentication failed");
    }
  } catch (error) { 
    console.error("Network error:", error);
  }
  })

registerForm.addEventListener("submit", async (event) =>{
  event.preventDefault();
  const usernameValue = document.getElementById("reg-username").value;
  const passwordValue = document.getElementById("reg-password").value;
  try{
    const route = "/users/register";
    const response = await fetch(API_URL + route , {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username: usernameValue,
        password: passwordValue,
      }),
    } )
    const data = await response.json();
    if (response.ok) {
      alert("Success! Now log in.");
      setAuthMode(true);
    } else {
      alert(data.detail || "Registration failed");
    }

  } catch(error) {
    console.error("Network error:", error);
  }
})

}

export function checkAuth() {
  return !!localStorage.getItem("token");
}

export function handleSessionExpired() {
  alert("Your session has expired. Please log in again.");
  localStorage.removeItem("token");
  window.location.reload();
}
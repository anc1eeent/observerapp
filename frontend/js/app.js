const API_URL = "http://127.0.0.1:8000";
const API = {
  async request(endpoint, method = "GET", body = null){
    const token = localStorage.getItem("token");
    const headers = {};

    if (token){
      headers["Authorization"] = `Bearer ${token}`;
    }
    if (body){
      headers["Content-Type"] = "application/json";
    }
    try {
      const options = {
        method: method,
        headers: headers,
      }
      if(body){
        options.body = JSON.stringify(body);
      }
      const response = await fetch(API_URL + endpoint, options);
      if (response.status === 401){
        handleSessionExpired();
        return null;
      }
      if (response.ok){
        return await response.json();
      }
      const errorData = await response.json();
      throw new Error(errorData.detail || "[Error] can't reach server.")
    } catch (error) {
      console.error(`[API ERROR] ${method} ${endpoint}: `, error);
      throw error;
    }
  }
};
const authContainer = document.getElementById("auth-container");
const taskSection = document.getElementById("task-section");
const authForm = document.getElementById("register-form");
const switchBtn = document.getElementById("switch-to-login");

let isLoginMode = false;

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
    response = await fetch(API_URL + "/login", {
        method: "POST",
        body: formData
      });
  } else {
    const route = "/register";
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
        checkAuth();
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

function checkAuth() {
  const token = localStorage.getItem("token");

  if (token) {
    authContainer.classList.add("hidden");
    taskSection.classList.remove("hidden");
    loadData();
    loadProfile();
  } else {
    authContainer.classList.remove("hidden");
    taskSection.classList.add("hidden");
  }
}

checkAuth();

function handleSessionExpired() {
  alert("Your session has expired. Please log in again.");
  localStorage.removeItem("token");
  checkAuth();
  if (!isLoginMode) switchBtn.click();
}

const addTaskBtn = document.getElementById("add-task-btn");
addTaskBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  const titleValue = document.getElementById("new-task-title").value.trim();
  const descValue = document.getElementById("new-task-desc").value.trim();
  if (!titleValue) {
    alert("[ERROR]: Can't be empty!");
    return;
  }
  try {
      const response = await API.request("/tasks/", "POST", {title: titleValue, description: descValue});
     if (response) {
      document.getElementById("new-task-title").value = "";
      document.getElementById("new-task-desc").value = "";
      loadData();
    }
  } catch (error) {
    console.error(error);
  }
});

const taskListContainer = document.getElementById("task-list")

taskListContainer.addEventListener("click", async (event) =>{
  if (event.target.classList.contains("delete-task-btn")){
    const taskId = event.target.getAttribute("data-id");
      await API.request(`/tasks/${taskId}`, "DELETE");
      loadData();
  }
});

async function loadData() {
  const containter = document.getElementById("task-list");
  containter.innerHTML = "";
  try {
    const tasks = await API.request("/tasks/");
    if (tasks){
      tasks.forEach(task => {
      const taskHTML = `
  <div class="task-card ${task.completed ? 'completed' : ''}" style="border: 1px solid gray; padding: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div class="task-content" style="display: flex; gap: 10px; align-items: flex-start;">
          <input type="checkbox" class="task-complete-cb" data-id="${task.id}" ${task.completed ? 'checked' : ''} style="margin-top: 5px;">
          <div>
              <h3 style="margin: 0; ${task.completed ? 'text-decoration: line-through; color: gray;' : ''}">${task.title}</h3>
              <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #ccc;">${task.description || ''}</p>
          </div>
      </div>
      <div class="task-actions" style="display: flex; gap: 5px;">
          <button class="edit-task-btn" data-id="${task.id}" style="cursor: pointer; background: transparent; border: none; font-size: 1.2em;">✏️</button>
          <button class="delete-task-btn" data-id="${task.id}" style="cursor: pointer; background: transparent; border: none; font-size: 1.2em;">🗑️</button>
      </div>
  </div>
`;
      containter.innerHTML += taskHTML;
    });
   }
  } catch (error) {
    console.error(error);
  }
}

const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  checkAuth();
});

const profileTrigger = document.getElementById("profile-trigger");
const profileOverlay = document.getElementById("profile-overlay");
const closeProfileBtn = document.getElementById("close-profile-btn");
const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");
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

async function loadProfile(){
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

const navBtns = document.querySelectorAll('.nav-icon-btn');
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

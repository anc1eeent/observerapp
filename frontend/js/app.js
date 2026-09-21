import { setupAuth, checkAuth } from "./auth.js";
import { setupTasks, loadData } from './tasks.js';
import { pomodoroPageInit, renderPomodoroTaskSelector, setupNavigation } from "./ui.js";
import { setupProfile, loadProfile } from "./profile.js";
import { setupPomodoro } from "./pomodoro.js";

const authContainer = document.getElementById("auth-container");
const taskSection = document.getElementById("task-section");

function handleLoginSuccess(){
    authContainer.classList.add("hidden");
    taskSection.classList.remove("hidden");
    loadProfile();
    loadData();
}

setupProfile();
setupNavigation();
setupTasks();
setupAuth(handleLoginSuccess);
setupPomodoro();
pomodoroPageInit();


if (checkAuth()){
    handleLoginSuccess();
} else {
    authContainer.classList.remove("hidden");
    taskSection.classList.add("hidden");
}



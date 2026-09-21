import { setCurrentTaskId } from "./pomodoro";

export function setupNavigation() {
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
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    location.reload();
  })
}

export function pomodoroPageInit(){
  const pomodoroBtn = document.getElementById("nav-pomodoro-btn");
  if (pomodoroBtn) {
    pomodoroBtn.addEventListener("click", async (event) => {
    const tasks = await API.request("/tasks/");
    renderPomodoroTaskSelector(tasks);
  });
}
}

export function renderPomodoroTaskSelector(tasks){
  const selectContainer = document.createElement("select");
  selectContainer.id = "task-selector";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choose task you want to complete.";
  selectContainer.appendChild(defaultOption);

  tasks.forEach(task =>{
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = task.title;
    selectContainer.appendChild(option);
  })

  const targetDiv = document.getElementById("task-selector-container");
  targetDiv.innerHTML = "";
  targetDiv.appendChild(selectContainer);

  selectContainer.addEventListener("change", (event) => {
    const selectedId = event.target.value;
    if (!selectedId) {
      setCurrentTaskId(null);
    } else {
      setCurrentTaskId(parseInt(selectedId, 10))
    }
  })
}

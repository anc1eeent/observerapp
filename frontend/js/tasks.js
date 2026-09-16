import { API } from './api.js';
let editingTaskId = null;

export function setupTasks(){
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
      let endpoint = "/tasks/";
      let method = "POST";
      if (editingTaskId != null){
          endpoint = `/tasks/${editingTaskId}`;
          method = "PUT";
        }
        const response = await API.request(endpoint, method, {title: titleValue, description: descValue});
      if (response) {
        document.getElementById("new-task-title").value = "";
        document.getElementById("new-task-desc").value = "";
        loadData();
        editingTaskId = null;
      }
    } catch (error) {
      console.error(error);
    }
  });

  const taskListContainer = document.getElementById("task-list");

  taskListContainer.addEventListener("click", async (event) =>{
    if (event.target.classList.contains("delete-task-btn")){
      const taskId = event.target.getAttribute("data-id");
        await API.request(`/tasks/${taskId}`, "DELETE");
        loadData();
    }
    else if (event.target.classList.contains("edit-task-btn")){
      const taskId = event.target.getAttribute("data-id");
      const taskCard = event.target.closest(".task-card");
      const currentTitle = taskCard.querySelector("h3").textContent;
      const currentDesc = taskCard.querySelector("p").textContent;
      editingTaskId = taskId;
      document.getElementById("new-task-title").value = currentTitle;
      document.getElementById("new-task-desc").value = currentDesc;
      }
    else if (event.target.classList.contains("task-complete-cb")){
    const taskId = event.target.dataset.id;
    const isCompleted = event.target.checked; 

    try {
      await API.request(`/tasks/${taskId}`, "PUT", { 
        completed: isCompleted 
      });
      loadData(); 
      } catch (error) {
      event.target.checked = !isCompleted;
      console.error(error);
      }
    }
});
}

export async function loadData() {
  const container = document.getElementById("task-list");
  container.innerHTML = "";

  try {
    const tasks = await API.request("/tasks/");
    if (tasks) {
      tasks.forEach(task => {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("task-card");
        if (task.completed) {
          cardDiv.classList.add("completed");
        }
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("task-complete-cb");
        checkbox.dataset.id = task.id; 
        checkbox.checked = task.completed;
        
        const h3Element = document.createElement("h3");
        h3Element.textContent = task.title;

        const descBox = document.createElement("p");
        descBox.textContent = task.description || "";

        const taskEditBtn = document.createElement("button");
        taskEditBtn.classList.add("edit-task-btn");
        taskEditBtn.dataset.id = task.id;
        taskEditBtn.textContent = "✏️";

        const taskDelBtn = document.createElement("button");
        taskDelBtn.classList.add("delete-task-btn");
        taskDelBtn.dataset.id = task.id;
        taskDelBtn.textContent = "🗑️";

        
        cardDiv.appendChild(checkbox);
        cardDiv.appendChild(h3Element);
        cardDiv.appendChild(descBox);
        cardDiv.appendChild(taskEditBtn);
        cardDiv.appendChild(taskDelBtn);

        container.appendChild(cardDiv);
        
      });
    }
  } catch(error) {
    console.error(error);
  }
}

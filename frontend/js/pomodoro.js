/**
 * Pomodoro page: a countdown timer that can be linked to a task.
 * A finished or stopped session is saved through POST /pomodoro/.
 *
 * States: idle -> running <-> paused -> idle (after saving or discarding).
 */
import { API } from './api.js';
import { confirmDialog } from './dialogs.js';
import { showError, showSuccess } from './ui.js';

const DEFAULT_MINUTES = 25;
// Shorter sessions are not worth saving; the user is asked to discard them.
const MIN_SESSION_SECONDS = 60;

let timerInterval = null;
let initialSeconds = DEFAULT_MINUTES * 60;
let currentSeconds = initialSeconds;
let currentTaskId = null; // null means "no task"
let isActive = false; // true while a session is running or paused

function getElements() {
  return {
    display: document.getElementById("timer-display"),
    progressBar: document.getElementById("timer-progress-bar"),
    editArea: document.getElementById("timer-edit-area"),
    minutesInput: document.getElementById("timer-input-minutes"),
    setButton: document.getElementById("timer-set-btn"),
    startButton: document.getElementById("timer-start-btn"),
    pauseButton: document.getElementById("timer-pause-btn"),
    saveButton: document.getElementById("timer-save-btn"),
  };
}

export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimerDisplay() {
  const { display, progressBar } = getElements();
  display.textContent = formatTime(currentSeconds);
  const progress = (initialSeconds - currentSeconds) / initialSeconds;
  progressBar.style.width = `${Math.min(Math.max(progress, 0), 1) * 100}%`;
}

/** Shows the buttons that make sense in the current state. */
function updateControls() {
  const { display, startButton, pauseButton, saveButton } = getElements();
  const isRunning = timerInterval !== null;
  // The duration can only be changed before a session starts.
  display.disabled = isActive;
  const selector = document.getElementById("task-selector");
  if (selector) selector.disabled = isActive;
  startButton.classList.toggle("hidden", isActive);
  pauseButton.classList.toggle("hidden", !isActive);
  saveButton.classList.toggle("hidden", !isActive);
  pauseButton.textContent = isRunning ? "Pause" : "Resume";
}

function tick() {
  currentSeconds--;
  updateTimerDisplay();
  if (currentSeconds <= 0) {
    stopInterval();
    saveSession(true);
  }
}

function stopInterval() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function startTimer() {
  if (timerInterval !== null) return;
  isActive = true;
  getElements().editArea.classList.add("hidden");
  timerInterval = setInterval(tick, 1000);
  updateControls();
}

function togglePause() {
  if (timerInterval !== null) {
    stopInterval();
  } else {
    startTimer();
  }
  updateControls();
}

function resetTimer() {
  stopInterval();
  isActive = false;
  currentSeconds = initialSeconds;
  updateTimerDisplay();
  updateControls();
}

/**
 * Saves the time spent in the current session.
 * isFinished is true when the countdown reached zero.
 */
async function saveSession(isFinished = false) {
  stopInterval();
  updateControls();
  const spentSeconds = initialSeconds - currentSeconds;

  if (spentSeconds < MIN_SESSION_SECONDS) {
    const discard = await confirmDialog({
      title: "Discard this session?",
      message: "Sessions shorter than a minute are not saved.",
      confirmText: "Discard",
      danger: true,
    });
    if (discard) {
      resetTimer();
    }
    return;
  }

  try {
    await API.request("/pomodoro/", "POST", {
      duration_seconds: spentSeconds,
      task_id: currentTaskId,
    });
    showSuccess(isFinished ? "Session complete and saved. Nice work!" : "Session saved.");
    resetTimer();
  } catch (error) {
    // The session stays paused, so the user can press Save again.
    showError(error);
  }
}

/** Applies the duration typed by the user; only allowed while idle. */
function setDuration() {
  const { minutesInput, editArea } = getElements();
  const minutes = parseInt(minutesInput.value, 10);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) {
    showError(new Error("Duration must be between 1 and 120 minutes."));
    return;
  }
  initialSeconds = minutes * 60;
  editArea.classList.add("hidden");
  resetTimer();
}

export function setupPomodoro() {
  const { display, editArea, setButton, startButton, pauseButton, saveButton } = getElements();

  startButton.addEventListener("click", startTimer);
  pauseButton.addEventListener("click", togglePause);
  saveButton.addEventListener("click", () => saveSession(false));
  setButton.addEventListener("click", setDuration);
  display.addEventListener("click", () => {
    if (!isActive) {
      editArea.classList.toggle("hidden");
    }
  });

  updateTimerDisplay();
  updateControls();
}

/** Builds the task selector; the empty option means "no task". */
export function renderPomodoroTaskSelector(tasks) {
  const select = document.createElement("select");
  select.id = "task-selector";
  select.className = "input";
  select.disabled = isActive;

  const noTaskOption = document.createElement("option");
  noTaskOption.value = "";
  noTaskOption.textContent = "No task, just focus";
  select.appendChild(noTaskOption);

  tasks
    .filter(task => !task.completed)
    .forEach(task => {
      const option = document.createElement("option");
      option.value = task.id;
      option.textContent = task.title;
      select.appendChild(option);
    });

  // Keep the previous choice if that task is still available.
  select.value = currentTaskId !== null ? String(currentTaskId) : "";
  if (select.value === "") {
    currentTaskId = null;
  }

  select.addEventListener("change", (event) => {
    const selectedId = event.target.value;
    currentTaskId = selectedId ? parseInt(selectedId, 10) : null;
  });

  const container = document.getElementById("task-selector-container");
  container.innerHTML = "";
  container.appendChild(select);
}

/** Reloads the task list each time the Pomodoro page is opened. */
export function pomodoroPageInit() {
  const pomodoroNavButton = document.getElementById("nav-pomodoro-btn");
  if (!pomodoroNavButton) return;
  pomodoroNavButton.addEventListener("click", async () => {
    try {
      const tasks = await API.request("/tasks/");
      renderPomodoroTaskSelector(tasks || []);
    } catch (error) {
      showError(error);
    }
  });
}

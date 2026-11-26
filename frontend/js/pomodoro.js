/**
 * Pomodoro page: a countdown timer that can be linked to a task.
 * A finished or stopped session is saved through POST /pomodoro/.
 *
 * States: idle -> running <-> paused -> idle (after saving or discarding).
 */
import { API } from './api.js';
import { confirmDialog } from './dialogs.js';
import { formatDuration, startOfDay } from './dates.js';
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
    loadPomodoroPage();
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

// ---------- Statistics ----------

const DAYS_IN_CHART = 7;
let taskTitles = new Map(); // task id -> title, for the recent sessions list

/** Sums sessions per local day for the last 7 days, oldest first. */
function sessionsPerDay(sessions) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: DAYS_IN_CHART }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (DAYS_IN_CHART - 1 - index));
    return { date, seconds: 0 };
  });
  sessions.forEach((session) => {
    const day = startOfDay(new Date(session.created_at)).getTime();
    const bucket = days.find((item) => item.date.getTime() === day);
    if (bucket) bucket.seconds += session.duration_seconds;
  });
  return days;
}

function renderChart(days) {
  const chart = document.getElementById("focus-chart");
  const maxSeconds = Math.max(...days.map((day) => day.seconds), 1);
  chart.replaceChildren();

  days.forEach((day, index) => {
    const column = document.createElement("div");
    column.className = "chart-column";
    column.title = `${day.date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}: ${formatDuration(day.seconds)}`;

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.classList.toggle("is-today", index === days.length - 1);
    bar.style.height = `${Math.round((day.seconds / maxSeconds) * 100)}%`;

    const label = document.createElement("span");
    label.className = "chart-label";
    label.textContent = day.date.toLocaleDateString(undefined, { weekday: "narrow" });

    const track = document.createElement("div");
    track.className = "chart-track";
    track.append(bar);
    column.append(track, label);
    chart.append(column);
  });
}

function renderRecentSessions(sessions) {
  const list = document.getElementById("recent-sessions");
  list.replaceChildren();
  const recent = [...sessions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (!recent.length) {
    const empty = document.createElement("li");
    empty.className = "recent-empty";
    empty.textContent = "No sessions yet. Start the timer to log your first one.";
    list.append(empty);
    return;
  }

  recent.forEach((session) => {
    const item = document.createElement("li");
    const title = document.createElement("span");
    title.className = "recent-title";
    title.textContent = session.task_id ? taskTitles.get(session.task_id) ?? "Deleted task" : "No task";
    const details = document.createElement("span");
    details.className = "recent-details";
    const when = new Date(session.created_at).toLocaleString(undefined, {
      weekday: "short", hour: "2-digit", minute: "2-digit",
    });
    details.textContent = `${formatDuration(session.duration_seconds)} · ${when}`;
    item.append(title, details);
    list.append(item);
  });
}

function renderStats(sessions) {
  const days = sessionsPerDay(sessions);
  const today = days[days.length - 1];
  const todaySessions = sessions.filter(
    (session) => startOfDay(new Date(session.created_at)).getTime() === today.date.getTime(),
  ).length;
  const weekSeconds = days.reduce((sum, day) => sum + day.seconds, 0);

  document.getElementById("stat-today").textContent = formatDuration(today.seconds);
  document.getElementById("stat-sessions").textContent = String(todaySessions);
  document.getElementById("stat-week").textContent = formatDuration(weekSeconds);
  renderChart(days);
  renderRecentSessions(sessions);
}

/** Loads tasks for the selector and sessions for the statistics. */
async function loadPomodoroPage() {
  try {
    const [tasks, sessions] = await Promise.all([
      API.request("/tasks/"),
      API.request("/pomodoro/"),
    ]);
    taskTitles = new Map((tasks || []).map((task) => [task.id, task.title]));
    renderPomodoroTaskSelector(tasks || []);
    renderStats(sessions || []);
  } catch (error) {
    showError(error);
  }
}

/** Opens the Pomodoro page with the given task selected (used by the task board). */
export function focusOnTask(taskId) {
  if (isActive) {
    showError(new Error("A session is already running. Finish it before switching tasks."));
  } else {
    currentTaskId = taskId;
  }
  document.getElementById("nav-pomodoro-btn").click();
}

/** Reloads the page data each time the Pomodoro page is opened. */
export function pomodoroPageInit() {
  const pomodoroNavButton = document.getElementById("nav-pomodoro-btn");
  if (!pomodoroNavButton) return;
  pomodoroNavButton.addEventListener("click", loadPomodoroPage);
}

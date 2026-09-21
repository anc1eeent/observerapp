import { API, API_URL } from './api.js';

let timerInterval = null; // interval id
let currentSeconds = 0; // current time (++ or --)
let isCountDown = true; // true - pomodoro mode , false - stopwatch
let currentTaskId = null; // connection with task id (api)
let initialSeconds = null;

export function updateTimerDisplay(seconds){
    const currentTime = formatTime(seconds);
    const displayTimer = document.getElementById("timer-display");
    displayTimer.textContent = currentTime;
}

export function startTimer(){
    if (timerInterval !== null) return;

    timerInterval = setInterval(() => {
        if (isCountDown){
            currentSeconds--;
            if (currentSeconds <= 0){
                clearInterval(timerInterval);
                timerInterval = null;
                
            }
        } else {
            currentSeconds++;
        }
        updateTimerDisplay(currentSeconds);

    }, 1000);
    
}

export function formatTime(totalSeconds){
    const minutes = Math.floor((totalSeconds / 60));
    const seconds = totalSeconds % 60

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function setupPomodoro() {
    const startButton = document.getElementById("start-btn");
    const pauseButton = document.getElementById("pause-btn");
    const resumeButton = document.getElementById("resume-btn");
    const exitButton = document.getElementById("exit-timer-btn");

    if (startButton) startButton.addEventListener("click", () => startTimer());
    if (pauseButton) pauseButton.addEventListener("click", () => pauseTimer());
    if (resumeButton) resumeButton.addEventListener("click", () => resumeTimer());
    if (exitButton) exitButton.addEventListener("click", () => exitTimer());
}

export function setCurrentTaskId(id){
    if (!id) throw new Error("Task ID is required.");
     currentTaskId = id;
     console.log("expected id:", currentTaskId);
}

export function pauseTimer(){
    if (timerInterval === null) return;
    clearInterval(timerInterval);
    timerInterval = null;
}

export function resumeTimer(){
    startTimer();
}

export async function exitTimer(){
    pauseTimer();
    let spentTime;
    if (isCountDown === true){
        spentTime = initialSeconds - currentSeconds;
    } else {
        spentTime = currentSeconds;
    }
    if (spentTime < 300){
        if (window.confirm("You had worked less then 300 seconds, it is not for record. Are you sure you want to exit?") === true){
            currentSeconds = 0;
           updateTimerDisplay(currentSeconds);
        } else {
            return resumeTimer();
        }

    } else {
    try {
        let endpoint = "/pomodoro/";
        let method = "POST";
        const response = await API.request(endpoint, method, {
            duration_seconds: spentTime,
            task_id: currentTaskId,
            description: ""
        })
        if (response){
            currentSeconds = 0;
            updateTimerDisplay(currentSeconds);
        }
    } catch (error){
        const shouldRetry = window.confirm("Can't save. Retry again?");
        if (shouldRetry){
            resumeTimer();
        } else {
            currentSeconds = 0;
           updateTimerDisplay(currentSeconds);
        }
    }
    }
}
    
        
import { API, API_URL } from './api.js';

let timerInterval = null; // interval id
let currentSeconds = 0; // current time (++ or --)
let isCountDown = true; // true - pomodoro mode , false - stopwatch
let currentTaskId = null; // connection with task id (api)

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
        const currentTime = formatTime(currentSeconds);
        const displayTimer = document.getElementById("timer-display");
        displayTimer.textContent = currentTime;

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

export function pauseTimer(){
    if (timerInterval === null) return;
    clearInterval(timerInterval);
    timerInterval = null;
}

export function resumeTimer(){
    startTimer();
}

export function exitTimer(){

}
    
        
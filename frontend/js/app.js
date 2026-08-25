const API_URL = 'http://127.0.0.1:8000';
const authContainer = document.getElementById('auth-container');
const taskSection = document.getElementById('task-section');
const authForm = document.getElementById('register-form');
const switchBtn = document.getElementById('switch-to-login');

let isLoginMode = false;

const formTitle = document.querySelector('#auth-form-section h2');
const submitBtn = authForm.querySelector('button');

switchBtn.addEventListener('click', (event) => {
    event.preventDefault();

    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        formTitle.textContent = 'Log In to Account';
        submitBtn.textContent = 'Sign In';
        switchBtn.textContent = 'Sign Up';
    }
    else {
        formTitle.textContent = 'Sign Up Account';
        submitBtn.textContent = 'Sign Up';
        switchBtn.textContent = 'Log in';
    }
});

authForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const usernameValue = document.getElementById('reg-username').value;
    const passwordValue = document.getElementById('reg-password').value;

    const route = isLoginMode ? '/login' : '/register';

    try {
        const response = await fetch(API_URL + route, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameValue,
                password: passwordValue
            })
        });
        const data = await response.json();

        if (response.ok) {
            if (isLoginMode) {
                localStorage.setItem('token', data.access_token);
                checkAuth();
            } else {
                alert('Success! Now log in.');
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
    const token = localStorage.getItem('token');

    if (token) {
        authContainer.style.display = 'none';
        taskSection.style.display = 'block';
    } else {
        authContainer.style.display = 'flex';
        taskSection.style.display = 'none';
    }
}

checkAuth();
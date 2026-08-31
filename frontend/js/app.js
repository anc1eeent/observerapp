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

const addTaskBtn = document.getElementById('add-task-btn');
addTaskBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const titleValue = document.getElementById('new-task-title').value.trim();
    const descValue = document.getElementById('new-task-desc').value.trim();
    if (!titleValue) {
        alert("[ERROR]: Can't be empty!")
        return
    }
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(API_URL + '/tasks/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title: titleValue, description: descValue })
        })
        if (response.ok) {
            document.getElementById('new-task-title').value = '';
            document.getElementById('new-task-desc').value = '';
        }
        else {
            alert("[ERROR]: Failed to create task!")
        }
    }
    catch (error) { console.error(error) }

});

async function loadData() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(API_URL + '/tasks/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const tasks = await response.json();
            console.log("My tasks: ", tasks);
        } else {
            console.error("[ERROR] Cound'nt get tasks.");
        }
    } catch (error) {
        console.error(error);
    }
}

const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    checkAuth();
});
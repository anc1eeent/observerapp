const API_URL = 'http://127.0.0.1:8000';

const authSection = document.getElementById('auth-section');
const taskSection = document.getElementById('task-section');

function checkAuth() {
    const token = localStorage.getItem('token');

    if (token) {
        authSection.style.display = 'none';
        taskSection.style.display = 'block';
        loadData();
    } else {
        authSection.style.display = 'block';
        taskSection.style.display = 'none';
    }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('login-username').value;
    const passwordInput = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            checkAuth();
        } else {
            alert(data.detail || 'Помилка логіну');
        }
    } catch (error) {
        console.error('Login error:', error);
    }
});

async function loadData() {
    try {
        const token = localStorage.getItem('token');

        let response = await fetch(`${API_URL}/tasks`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let dataArray = await response.json();
        let container = document.getElementById('task-list');

        container.innerHTML = '';

        dataArray.forEach(itemText => {
            let p = document.createElement('p');
            p.textContent = itemText.title;
            container.appendChild(p);
        })
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

checkAuth();
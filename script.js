async function loadData() {
    try {
        let response = await fetch('http://127.0.0.1:8000/tasks');
        let dataArray = await response.json();
        let containter = document.getElementById('task-list');

        dataArray.forEach(itemText => {
            let p = document.createElement('p');
            p.textContent = itemText.title;
            containter.appendChild(p);
        })
    }
    catch (error) {
        console.error('Error fetching data:', error);
    }
}

loadData();
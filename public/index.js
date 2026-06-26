const API_URL = '/tasks';

const taskForm = document.getElementById('taskForm');
const pendingTasks = document.getElementById('pendingTasks');
const completedTasks = document.getElementById('completedTasks');

let currentCategory = 'today';
let currentStatus = 'pending';

const categoryButtons = document.querySelectorAll('.tab-button');
const pendingTab = document.getElementById('pendingTab');
const completedTab = document.getElementById('completedTab');

async function loadTasks() {
    pendingTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    const res = await fetch(API_URL);
    const tasks = await res.json();

    tasks.filter(task => task.category === currentCategory)
    .forEach(task => {
        const li = document.createElement('li');

        li.innerHTML = `
            <span>${task.description}</span>
            <div>
                <button class="action" onclick="toggleTask(${task.id}, ${task.completed})">
                    ${task.completed ? 'Reabrir' : 'Concluir'}
                </button>
                ${!task.completed ? `<button class="action" onclick="editTask(${task.id}, '${task.description}')">Editar</button>` : ''}
                <button class="action" onclick="deleteTask(${task.id})">Excluir</button>
            </div>
        `;

        if(task.completed){
            completedTasks.appendChild(li);
        } else {
            pendingTasks.appendChild(li);
        }
    });
}

categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentCategory = button.dataset.category;
        loadTasks();
    });
});

pendingTab.addEventListener('click', () => {
    currentStatus = 'pending';
    pendingTab.classList.add('active');
    completedTab.classList.remove('active');
    loadTasks();
});

completedTab.addEventListener('click', () => {
    currentStatus = 'completed';
    completedTab.classList.add('active');
    pendingTab.classList.remove('active');
    loadTasks();
});

taskForm.addEventListener('submit', async e => {
    e.preventDefault();

    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;

    if(!description) return;

    await fetch(API_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            description,
            category,
            completed:false
        })
    });

    taskForm.reset();
    loadTasks();
});

async function toggleTask(id, completed){
    await fetch(`${API_URL}/${id}`,{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({completed:!completed})
    });

    loadTasks();
}

async function deleteTask(id){
    await fetch(`${API_URL}/${id}`,{
        method:'DELETE'
    });

    loadTasks();
}

async function editTask(id, description){
    const newDescription = prompt('Editar tarefa:', description);

    if(!newDescription) return;

    await fetch(`${API_URL}/${id}`,{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({description:newDescription})
    });

    loadTasks();
}

loadTasks();

const API_URL = '/tasks';

const taskForm = document.getElementById('taskForm')
const pendingTasks = document.getElementById('pendingTasks')
const completedTasks = document.getElementById('completedTasks')

const pendingTab = document.getElementById('pendingTab')
const completedTab = document.getElementById('completedTab')
const pendingPanel = document.getElementById('pendingPanel')
const completedPanel = document.getElementById('completedPanel')

const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');

// CARREGAR TAREFAS 
async function loadTasks() {//Essa função serve para buscar as tarefas no backend e mostrar na tela
    pendingTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    const res = await fetch(API_URL);
    const tasks = await res.json();


    let totalPending = 0;
    let totalCompleted = 0;

    tasks.forEach(task => {
        const li = document.createElement('li')
        li.className = task.completed ? 'completed' : "";
        li.innerHTML = `
            <span>${task.description}</span>
            <div class="tarefas">
                ${task.completed
                ?
                `<button class="action toggle" onclick="toggleTask(${task.id}, ${task.completed})"> Reabrir </button>
                    <button class="action delete" onclick="deleteTask(${task.id})"> Excluir </button>`
                :
                `<button class="action toggle" onclick="toggleTask(${task.id}, ${task.completed})"> Concluir </button>
                    <button class="action edit" onclick="editTask(${task.id}, '${task.description}')"> Editar </button>
                    <button class="action delete" onclick="deleteTask(${task.id})"> Excluir </button>`
            }
            </div>
        `;

        if (task.completed) {
            totalCompleted++
            completedTasks.appendChild(li);
        } else {
            totalPending++
            pendingTasks.appendChild(li)
        }
    });
    pendingCount.textContent = totalPending;
    completedCount.textContent = totalCompleted;

}


//adicionar tarefa
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value.trim(); // o que o usuario digitou

    if (!description) return;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Estou enviando dados em formato JSON.
        body: JSON.stringify({ description })
    })

    taskForm.reset();
    await loadTasks();
})

// editar tasks
async function editTask(id, currentDescription) {
    const modal = document.createElement('div');
    modal.className = 'edit-modal-overlay';

    modal.innerHTML = `
        <div class="edit-modal">
            <h2>Editar tarefa</h2>
        <input type="text" id="editDescription" placeholder="Digite a nova descrição">
            <div class="edit-modal-actions">
                <button class="cancel-edit" type="button">Cancelar</button>
                <button class="save-edit" type="button">Salvar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const editInput = document.getElementById('editDescription');
    const cancelButton = modal.querySelector('.cancel-edit');
    const saveButton = modal.querySelector('.save-edit');

    editInput.value = currentDescription;
    editInput.focus();
    editInput.select();

    cancelButton.addEventListener('click', () => {
        modal.remove();
    });

    saveButton.addEventListener('click', async () => {
        const newDescription = editInput.value.trim();

        if (!newDescription) return;

        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: newDescription })
        });

        saveButton.disabled = true;
        saveButton.textContent = 'Salvando...';

        modal.remove();
        await loadTasks();
    });
}

// deletar tasks
async function deleteTask(id) {
    const modal = document.createElement('div');
    modal.className = 'delete-modal-overlay';

    modal.innerHTML = `
        <div class="delete-modal">
            <h2>Excluir tarefa</h2>
            <p>Tem certeza que deseja excluir esta tarefa?</p>
            <div class="delete-modal-actions">
                <button class="cancel-delete" type="button">Cancelar</button>
                <button class="confirm-delete" type="button">Excluir</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const cancelButton = modal.querySelector('.cancel-delete');
    const confirmButton = modal.querySelector('.confirm-delete');

    cancelButton.addEventListener('click', () => {
        modal.remove();
    });

    confirmButton.addEventListener('click', async () => {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Excluindo...';

        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        modal.remove();
        await loadTasks();
    });
}

//Reabrir
async function toggleTask(id, completed) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
    });

    await loadTasks();
}

pendingTab.addEventListener('click', () => {
    pendingTab.classList.add('active');
    completedTab.classList.remove('active');

    pendingPanel.classList.add('active');
    completedPanel.classList.remove('active');
});

completedTab.addEventListener('click', () => {
    completedTab.classList.add('active');
    pendingTab.classList.remove('active');

    completedPanel.classList.add('active');
    pendingPanel.classList.remove('active');
});

loadTasks();

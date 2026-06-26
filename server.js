//Recebe pedidos do front-end
// ↓
// Entende se é criar, listar, editar ou excluir
// ↓
// Conecta no MySQL
// ↓
// Executa SQL
// ↓
// Devolve resposta para o script.js


require('dotenv').config();
const express = require('express')
const mysql = require('mysql2/promise');

const app = express()
const PORT = process.env.PORT || 3007;

const path = require('path') //Ele serve para trabalhar com caminhos de arquivos e pastas.
    app.use(express.static(path.join(__dirname, 'public'))); //Serve para: fazer o Express entregar os arquivos da pasta public.
    app.use(express.json()); //Serve para: permitir que o backend leia JSON enviado pelo front.

//config da conexao do banco de dados
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'task_dashboard'
};


// Criar tarefa
app.post('/tasks', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const { description } = req.body;

        const [result] = await connection.execute(
            'INSERT INTO tasks (description) VALUES (?)',
            [description]
        );

        await connection.end();

        res.status(201).json({
            id: result.insertId,
            description,
            completed: false
        });

    } catch (error) {
        console.error('erro ao criar tarefa', error);
        res.status(500).json({ error: 'erro interno do servidor' });
    }
})




// Listar tarefas
app.get('/tasks', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT * FROM tasks ORDER BY id DESC'
        );
        await connection.end();
        res.json(rows)
    } catch (error) {
        console.error('Erro ao listar tarefas:', error);
        res.status(500).json({ error: 'erro interno do servidor' });
    }
});


//configurando o put
app.put('/tasks/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const { id } = req.params;
        const { description, completed } = req.body;

        const [currentTask] = await connection.execute(
            'SELECT * FROM tasks WHERE id = ?',
            [id]
        );

        if (currentTask.length === 0) {
            await connection.end();
            return res.status(404).json({ error: 'tarefa não encontrada' });
        }

        const newDescription = description ?? currentTask[0].description;
        const newCompleted = completed ?? currentTask[0].completed;

        await connection.execute(
            'UPDATE tasks SET description = ?, completed = ? WHERE id = ?',
            [newDescription, newCompleted, id]);
        await connection.end();
        res.json({ id, description: newDescription, completed: newCompleted });
    } catch (error) {
        console.error('Erro ao editar tarefa:', error);
        res.status(500).json({ error: 'erro interno do servidor' });
    }
})


//configurando o delete
app.delete('/tasks/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const { id } = req.params;
        await connection.execute(
            'DELETE FROM tasks WHERE id = ?',
            [id]
        );
        await connection.end();
        res.json({ message: 'tarefa excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        res.status(500).json({ error: 'erro interno do servidor' });
    }
})



//configuração do servidor (porta)
app.listen(PORT, () => {
    console.log(`servidor rodando na porta ${PORT}`)
})

const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers;

    const user = users.find(user => user.username === username);

    if (!user) {
        return response.status(400).json({error: "User not found!" });
    }

    // Add object to the request - To get inside the method
    request.user = user;

    return next();
}

// function getTodo(request, id) {
//     const { username } = request.headers;

//     const user = users.find(user => user.username === username);
//     const todo = user.todos.find(todos => todos.id === id);

//     if (!todo) {
//         return response.status(400).json({error: "Todo not found!" });
//     }

//     return todo
// }

app.post('/users', (request, response) => {
    const {name, username} = request.body;
    
    // Verifica se já existe user com o username
    if (users.some((user) => user.username === username)) {
        return response.status(400).json({error: "User already exists!" });
    }

    const user = {
        id: uuidv4(), 
        name, 
        username, 
        todos: []
    };

    users.push(user);

    return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;

    return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {

    const { user } = request;
    const { title, deadline } = request.body;

    const todo = { 
        id: uuidv4(), 
        title: title,
        done: false, 
        deadline: new Date(deadline), 
	    created_at: new Date()
    }

    user.todos.push(todo);

    return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { title, deadline } = request.body;
    const todo = user.todos.find(todos => todos.id === request.params.id);

    if (!todo) {
        return response.status(404).json({'error':true});
    }
    
    todo.title = title;
    todo.deadline = deadline;

    return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const todo = user.todos.find(todos => todos.id === request.params.id);
    
    if (!todo) {
        return response.status(404).json({'error':true});
    }

    todo.done = true;

    return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const todo = user.todos.find(todos => todos.id === request.params.id);

    if (!todo) {
        return response.status(404).json({'error':true});
    }

    user.todos.splice(todo, 1);

    return response.status(204).send();
});

module.exports = app;
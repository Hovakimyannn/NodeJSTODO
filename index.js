"use strict";
const express = require('express');
const cors = require('cors');
const todo = require('./App/Http/Controllers/TodoController.js');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.listen(3333);

app.post('/create', (req, res) => {
    res.send(todo.create(req));
});

app.get('/get/:id', (req, res) => {
    res.send(todo.read(req));
});

app.get('/get', (req, res) => {
    res.send(todo.getAll());
});

app.put('/edit', (req, res) => {
    res.send(todo.update(req));
});

app.delete('/remove/:id', (req, res) => {
    res.send(todo.remove(req));
});

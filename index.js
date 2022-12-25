require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();
const PORT = process.env.PORT;
const url = process.env.MONGODB_URI;


const unknownEndpoint = (req, res) => {
    res.status(404).send({
        error: 'unknown endpoint'
    })
}

morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
});

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(morgan(':method :url :status - :response-time ms :body'));

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons' ,(req, res) => {
    Person.find({}).then(persons => {
        res.json(persons);
    })
});

app.get('/api/info', (req, res) => {
    const people = persons.length;
    const date = new Date();

    res.send(
        `<p>Phonebook has info for ${people} people</p>
        <p>${date}</p>`
    )
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);

    const person = persons.find(person => person.id === id);

    if (person) {
        res.json(person);
    } else {
        res.status(404).end();
    }
});

app.post('/api/persons', (req, res) => {
    const body = req.body;

    if(!body.name || !body.number) {
        return res.status(404).json({ 
            error: 'content missing'
        });
    }

    if(persons.findIndex(person => person.name === body.name) !== -1) {
        return res.status(500).json({
            error: 'person already on phonebook'
        })
    }

    const person = {
        id: Math.floor(Math.random() * 500),
        name: body.name,
        number: body.number,
    };

    persons = persons.concat(person);

    res.status(201).json(person);
});

app.put('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = persons.findIndex(person => person.id === id);
    const newNumber = req.body.number;
    persons[index].number = newNumber;

    res.status(204).end();
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);

    persons = persons.filter(person => person.id !== id);

    res.status(204).end();
});

app.use(unknownEndpoint);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
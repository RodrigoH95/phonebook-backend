require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();
const PORT = process.env.PORT;
const url = process.env.MONGODB_URI;


const unknownEndpoint = (req, res) => {
    res.status(404).send({
        error: 'unknown endpoint'
    })
}

const errorHandler = (err, req, res, next) => {
    console.log(err.message);

    if(err.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' });
    } else if (err.name === "ValidationError") {
        return res.status(400).json({ error: err.message});
    }

    next(err);
}

morgan.token('body', (req, res) => {
    return JSON.stringify(req.body);
});

app.use(express.static('build'));
app.use(express.json());
app.use(morgan(':method :url :status - :response-time ms :body'));


app.get('/api/persons' ,(req, res) => {
    Person.find({}).then(persons => {
        res.json(persons);
    })
});

app.get('/api/info', (req, res) => {
    const people = Person.find({}).then(result => {
        const date = new Date();
        res.send(
            `<p>Phonebook has info for ${result.length} people</p>
            <p>${date}</p>`
        )
    })
});

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) {
            res.json(person);
        } else {
            res.status(404).end();
        }
    })
    .catch(err => next(err));

});

app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    if(!body.name || !body.number) {
        return res.status(404).json({ 
            error: 'content missing'
        });
    }

    Person.find({ name: body.name}).then(result => {
        if(result !== []) {
            const person = new Person({
                name: body.name,
                number: body.number
            });
        
            person.save().then(savedPerson => {
                res.status(201).json(savedPerson);
            })
            .catch(err => next(err));
        } else {
            res.status(500).json({ error: "Person already on phonebook"});
        }
    })


});

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body;

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id,
        person,
        { new: true, runValidators: true, context: 'query' }
        )
        .then(updatedPerson => {
            res.json(updatedPerson);
        })
        .catch(err => next(err));
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end();
        })
        .catch(err => next(err));
});

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
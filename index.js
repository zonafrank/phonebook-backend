if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
let { persons } = require("./db.json");
const Person = require("./models/person");

const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ");
  })
);

const getNextId = () => {
  let nextId;
  do {
    nextId = Math.floor(Math.random() * 1000000);
  } while (persons.find((person) => person.id === nextId));

  return nextId;
};

app.get("/info", (req, res) => {
  const message = `<p>Phonebook has info for ${
    persons.length
  } people</p><p>${new Date().toString()}</p>`;
  res.send(message);
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.post("/api/persons", (req, res, next) => {
  const { name, number } = req.body;

  if (!typeof name === "string" || !name || name.trim().length === 0) {
    return res.status(400).json({ error: "name field missing" });
  }

  if (!typeof number === "string" || !number || number.trim().length === 0) {
    return res.status(400).json({ error: "number field missing" });
  }

  if (
    persons.find((person) => person.name.toLowerCase() === name.toLowerCase())
  ) {
    return res.status(400).json({ error: "name must be unique" });
  }

  const person = new Person({ name, number });
  person
    .save()
    .then((savedPerson) => {
      return res.json(savedPerson);
    })
    .catch((error) => {
      next(error);
    });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((foundPerson) => {
      if (foundPerson) {
        res.json(foundPerson);
      } else {
        res.status(400).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.put("/api/persons/:id", (req, res, next) => {
  const {
    body: { name, number },
  } = req;

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      res.send(updatedPerson);
    })
    .catch((error) => {
      next(error);
    });
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`Server started and listening on port ${PORT}`);
  });
});

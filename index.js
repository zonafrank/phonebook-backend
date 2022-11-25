const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
let { persons } = require("./db.json");

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
  res.json(persons);
});

app.post("/api/persons", (req, res) => {
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

  const personObject = {
    name,
    number,
    id: getNextId(),
  };

  persons = persons.concat(personObject);

  res.json(personObject);
});

app.get("/api/persons/:id", (req, res) => {
  const person = persons.find((person) => person.id === Number(req.params.id));
  if (person) {
    res.json(person);
  } else {
    res.status(400).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  persons = persons.filter((person) => person.id !== Number(req.params.id));
  res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started and listening on port ${PORT}`);
});

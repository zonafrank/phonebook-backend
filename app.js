const { MONGODB_URI } = require("./utils/config");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const Person = require("./models/person");
const personsRouter = require("./controllers/persons");

console.log("connecting to database");

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to database");
  })
  .catch((error) => {
    console.log("error connecting to database", error.message);
  });

const app = express();

app.use(cors());
app.use(express.static("build"));
app.use(express.json());

morgan.token("body", function (req) {
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

app.use("/api/persons", personsRouter);

app.get("/info", (req, res) => {
  Person.find({}).then((people) => {
    const messageLineOne = `<p>There are ${people.lenght} people in the database.</p>`;
    const messageLineTwo = `<p>${new Date().toString()}</p>`;
    res.send(`${messageLineOne}${messageLineTwo}`);
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

module.exports = app;

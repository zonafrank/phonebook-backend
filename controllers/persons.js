const personsRouter = require("express").Router();
const Person = require("../models/person");

personsRouter.get("/", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

personsRouter.post("/", (req, res, next) => {
  const { name, number } = req.body;

  if (!typeof name === "string" || !name || name.trim().length === 0) {
    return res.status(400).json({ error: "name field missing" });
  }

  if (!typeof number === "string" || !number || number.trim().length === 0) {
    return res.status(400).json({ error: "number field missing" });
  }

  Person.findOne({ name })
    .then((foundPerson) => {
      if (foundPerson) {
        return res.status(400).json({ error: "name must be unique" });
      } else {
        const person = new Person({ name, number });
        person
          .save()
          .then((savedPerson) => {
            return res.json(savedPerson);
          })
          .catch((error) => {
            next(error);
          });
      }
    })
    .catch((error) => next(error));
});

personsRouter.get("/:id", (req, res, next) => {
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

personsRouter.put("/:id", (req, res, next) => {
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

personsRouter.delete("/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = personsRouter;

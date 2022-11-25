const mongoose = require("mongoose");

const url = process.env.MONGODB_URI;

console.log("connecting to database");

mongoose
  .connect(url)
  .then(() => {
    console.log("connected to database");
  })
  .catch((error) => {
    console.log("error connecting to database", error.message);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model("Person", personSchema);
module.exports = Person;

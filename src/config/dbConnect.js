const mongoose = require("mongoose");

mongoose.set('strictQuery', false);

const port = process.env.PORT || 5000;

mongoose.connect("mongodb://localhost:27017/signInSignUpUserData", (err) => {
  if (err) {
    console.log(err.message);
  }
});

const connection = mongoose.connection;

connection.once("open", () => console.log("Connected"));

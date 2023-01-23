import mongoose, { set, connect, connection } from "mongoose";

set('strictQuery', false);

mongoose.connect("mongodb://localhost:27017/signInSignUpUserData", (err) => {
  if (err) {
    console.log(err.message);
  }
  // connection.once("open", () => console.log("Connected"));
  console.log("connected")
});


export default mongoose;
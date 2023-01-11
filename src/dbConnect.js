const mongoose = require('mongoose');

const port = process.env.PORT || 5000;

const dbConnect = async (req,res)=>{
    await mongoose.connect('mongodb://localhost:27017/signInSignUpUserData')
    .then(() => {
        console.log("connected");
    })
    .catch((error) => {
        console.log(error);
    })
}

module.exports = dbConnect
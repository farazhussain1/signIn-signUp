const mongoose = require('mongoose')

const UserSchema = mongoose.mongoose.Schema({
    username:{
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true
    },
    isVerified :  {
        type: Boolean,
        default: false
    }
    
},{timestamps : true});

module.exports = mongoose.model("User",UserSchema);

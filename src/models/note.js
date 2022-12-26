const mongoose = require('mongoose')

const NoteSchema = mongoose.mongoose.Schema({
    title:{
        type: String,
        require: true
    },
    description:{
        type: String,
        require: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    }
},{timestamps : true});

module.exports = mongoose.model("Note",NoteSchema);

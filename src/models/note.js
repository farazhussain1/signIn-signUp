const mongoose = require('mongoose')

mongoose.set('strictQuery', false);

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
    },
    fileLoc:[{
        type: Object
    }]
},{timestamps : true});

module.exports = mongoose.model("Note",NoteSchema);

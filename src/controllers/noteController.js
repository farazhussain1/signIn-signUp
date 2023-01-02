const noteModel = require("../models/note");

const createNote = async (req, res) => {

    const { title, description} = req.body;

    try {
        const newNote = await noteModel.create({
            title: title,
            description : description,
            userId : req.userId
        });
        console.log(newNote);
        res.status(200).json({message:"Success! Note added"})    
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }
}

const updateNote = async (req, res) => {
    const id = req.params.id;
    const {title,description}= req.body;
    
    const newNote = {
        title: title,
        description: description,
        userId : req.userId
    }

    try {
        const note = await noteModel.findByIdAndUpdate(id,newNote,{new:true});
        if(!note){
            res.status(404).json({message: "Note not found"})  
        }
        return res.status(201).json(note);
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" })
    }
}

const deleteNote = async (req, res) => {
    const id = req.params.id;
    try {
        const note = await noteModel.findByIdAndRemove(id);
        if(!note){
          res.status(404).json({message: "Note not found"})  
        }
        res.status(202).json(note);
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }
}

const getNote = async (req, res) => {
    try {
        const notes = await noteModel.find({userId: req.userId})
        res.status(200).json(notes);
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" })
    }
}

const getNoteById = async (req, res) => {
    const id = req.params.id;
    try {
        const note = await noteModel.findOne({userId: req.userId, _id: id})
        if(!note){
          res.status(404).json({message: "Note not found"})  
        }
        res.status(200).json(note);
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong"})
    }
}

const getNoteByTitle = async (req, res) => {
    const title = req.params.title;
    try {
        const note = await noteModel.find({$or: [
            { title: {$regex :title}},
            { description: {$regex :title}}
        ]})
        if(!note){
          res.status(404).json({message: "Note not found"})  
        }
        res.status(200).json(note);
    } 
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong"})
    }
}

module.exports = { createNote,
     deleteNote, 
     updateNote, 
     getNote,
     getNoteById,
     getNoteByTitle 
};
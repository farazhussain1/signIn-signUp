const express = require('express');
const { getNote, updateNote, deleteNote, createNote, getNoteById, getNoteByTitle } = require('../controllers/noteController');
const noteRouter = express.Router();
const { auth } = require('../middlewares/auth')

noteRouter.get('/', auth, getNote)

noteRouter.get('/:id', auth, getNoteById)

noteRouter.get('/search/:title', auth, getNoteByTitle)

noteRouter.post('/', auth, createNote);

noteRouter.delete('/:id', auth, deleteNote);

noteRouter.put('/:id', auth, updateNote);

module.exports = noteRouter;
const express = require("express");
const noteRouter = express.Router();
const multer = require("multer");

const { auth } = require("../middlewares/auth");
const storage = require("./../middlewares/multerUpload");
const NotesController = require("../controllers/noteController");

const upload = multer({ storage: storage });

const notes = new NotesController();

noteRouter.get("/download/:fileName", auth, notes.download);

noteRouter.get("/", auth, notes.get);

noteRouter.get("/:id", auth, notes.getById);

noteRouter.get("/search/:title", auth, notes.getByTitle);

noteRouter.post("/", auth, upload.array("file"), notes.create);

noteRouter.delete("/:id", auth, notes.delete);

noteRouter.put("/:id", auth, notes.update);

module.exports = noteRouter;

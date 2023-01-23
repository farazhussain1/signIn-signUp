import express from "express";
import multer from "multer";
import { auth } from "../middlewares/auth";
import storage from "./../middlewares/multerUpload";
import { NotesController } from "../controllers/noteController";


const upload = multer({ storage: storage });
const notes = new NotesController();
export const noteRouter = express.Router();

noteRouter.get("/download/:fileName", auth, notes.download);

noteRouter.get("/", auth, notes.get);

noteRouter.get("/:id", auth, notes.getById);

noteRouter.get("/search/:title", auth, notes.getByTitle);

noteRouter.post("/", auth, upload.array("file"), notes.create);

noteRouter.delete("/:id", auth, notes.delete);

noteRouter.put("/:id", auth, notes.update);


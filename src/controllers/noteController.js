const noteModel = require("../models/note");

 class NotesController {
  
  /**
   * @description Get All Notes By UserId
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async get(req, res) {
    try {
      const notes = await noteModel.find({ userId: req.userId });
      res.status(200).json(notes);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  /**
   * @description send back the note with the ID if available
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async getById(req, res) {
    const id = req.params.id;
    try {
      const note = await noteModel.findOne({ userId: req.userId, _id: id });
      if (!note) {
        res.status(404).json({ message: "Note not found" });
      }
      res.status(200).json(note);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  /**
   * @description send back all notes with the title given
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async getByTitle(req, res) {
    const title = req.params.title;
    try {
      const note = await noteModel.find({
        $or: [{ title: { $regex: title } }, { description: { $regex: title } }],
      });
      if (!note) {
        res.status(404).json({ message: "Note not found" });
      }
      res.status(200).json(note);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  /**
   * @description creates a new note and adds to user notes
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async create(req, res) {
    const { title, description } = req.body;

    console.log(req.files);
    console.log("file", req.file, "body", req.body);

    try {
      const newNote = await noteModel.create({
        title: title,
        description: description,
        userId: req.userId,
        fileLoc: req.files,
      });
      console.log(newNote);
      res.status(200).json({ message: "Success! Note added" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  /**
   * @description update the requested note from users notes
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  update = async (req, res) => {
    const id = req.params.id;
    const { title, description } = req.body;

    const newNote = {
      title: title,
      description: description,
      userId: req.userId,
    };

    try {
      const note = await noteModel.findByIdAndUpdate(id, newNote, {
        new: true,
      });
      if (!note) {
        res.status(404).json({ message: "Note not found" });
      }
      return res.status(201).json(note);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };

  /**
   * @description deletes a particular note from the users notes
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async delete(req, res) {
    const id = req.params.id;
    try {
      const note = await noteModel.findByIdAndRemove(id);
      if (!note) {
        res.status(404).json({ message: "Note not found" });
      }
      res.status(202).json(note);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }
  }

  /**
   * @description Downloads a particular file requested by the user from his own section of Notes added
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns
   */
  async download(req, res) {
    const fileName = req.params.fileName;
    try {
      let notes = await noteModel.findOne({
        userId: req.userId,
        fileLoc: { $elemMatch: { filename: fileName } },
      });
      const file = notes?.fileLoc.find((file) => file.filename == fileName);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      return res.status(200).download(file.path, file.originalname);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = NotesController;
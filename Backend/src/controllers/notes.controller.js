import Notes from "../models/Notes.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags = [] } = req.body;
  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  const note = await Notes.create({ user: req.user._id, title, content, tags });
  res.status(201).json(note);
});

export const getNotes = asyncHandler(async (req, res) => {
  const notes = await Notes.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json(notes);
});

export const updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await Notes.findOneAndUpdate({ _id: id, user: req.user._id }, req.body, { new: true });
  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }
  res.json(note);
});

export const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await Notes.findOneAndDelete({ _id: id, user: req.user._id });
  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }
  res.json({ success: true });
});

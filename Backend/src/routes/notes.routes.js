import { Router } from "express";
import { createNote, deleteNote, getNotes, updateNote } from "../controllers/notes.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, createNote);
router.get("/", protect, getNotes);
router.put("/:id", protect, updateNote);
router.delete("/:id", protect, deleteNote);

export default router;

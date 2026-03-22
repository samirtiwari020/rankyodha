import { Router } from "express";
import { generatePractice, submitPractice } from "../controllers/practice.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/generate", protect, generatePractice);
router.post("/submit", protect, submitPractice);

export default router;

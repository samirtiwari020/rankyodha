import { Router } from "express";
import { addPoints, getGamification } from "../controllers/gamification.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getGamification);
router.post("/points", protect, addPoints);

export default router;

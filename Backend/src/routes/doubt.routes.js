import { Router } from "express";
import { solveDoubt } from "../controllers/doubt.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, solveDoubt);

export default router;

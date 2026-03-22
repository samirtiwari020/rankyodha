import { Router } from "express";
import { createPlan, getMyPlans } from "../controllers/planner.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, createPlan);
router.get("/", protect, getMyPlans);

export default router;

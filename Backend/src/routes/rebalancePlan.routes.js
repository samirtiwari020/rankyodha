import { Router } from "express";
import { rebalanceStudyPlan } from "../controllers/studyPlan.controller.js";

const router = Router();

router.post("/", rebalanceStudyPlan);

export default router;

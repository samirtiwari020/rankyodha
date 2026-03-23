import { Router } from "express";
import { generateMockStudyPlan, generateAIStudyPlan } from "../controllers/studyPlan.controller.js";

const router = Router();

router.post("/", generateMockStudyPlan);
router.post("/generate", generateAIStudyPlan);

export default router;

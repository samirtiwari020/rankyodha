import { Router } from "express";
import { generateMockStudyPlan } from "../controllers/studyPlan.controller.js";

const router = Router();

router.post("/", generateMockStudyPlan);

export default router;

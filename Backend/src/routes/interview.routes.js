import { Router } from "express";
import {
  evaluateInterview,
  generateInterviewQuestions
} from "../controllers/interview.controller.js";

const router = Router();

router.post("/generate", generateInterviewQuestions);
router.post("/evaluate", evaluateInterview);

export default router;
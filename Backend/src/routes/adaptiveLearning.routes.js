import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.middleware.js";
import {
  uploadAndTagQuestions,
  importQuestionsFromLocalDocumentFolder,
  getImportStatus,
  getPracticeQuestions,
  getQuestionCatalog,
  submitPracticeAnswers,
  getPerformanceAnalysis,
  getAdaptiveQuestions
} from "../controllers/adaptiveLearning.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post("/upload-pdf", protect, upload.single("document"), uploadAndTagQuestions);
router.post("/import-local", protect, importQuestionsFromLocalDocumentFolder);
router.get("/import-status/:jobId", protect, getImportStatus);
router.get("/practice", protect, getPracticeQuestions);
router.get("/catalog", protect, getQuestionCatalog);
router.post("/submit", protect, submitPracticeAnswers);
router.get("/analysis", protect, getPerformanceAnalysis);
router.get("/recommend", protect, getAdaptiveQuestions);

export default router;
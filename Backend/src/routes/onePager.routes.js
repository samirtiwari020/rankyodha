import { Router } from "express";
import multer from "multer";
import { generateOnePager } from "../controllers/onePager.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

router.post("/generate", upload.single("document"), generateOnePager);

export default router;
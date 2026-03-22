import { Router } from "express";
import { addRevision, getRevisions } from "../controllers/revision.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", protect, addRevision);
router.get("/", protect, getRevisions);

export default router;

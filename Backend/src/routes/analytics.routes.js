import { Router } from "express";
import { getAnalytics, getGraph } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", protect, getAnalytics);
router.get("/graph", protect, getGraph);

export default router;

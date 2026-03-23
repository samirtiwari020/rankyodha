import { Router } from "express";
import { getProfile, updateProfile, changePassword } from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.put("/password", protect, changePassword);

export default router;

import User from "../models/User.js";
import Achievement from "../models/Achievement.js";
import { awardPoints } from "../services/gamification.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const addPoints = asyncHandler(async (req, res) => {
  const { points = 0 } = req.body;
  const user = await awardPoints(req.user._id, Number(points) || 0);
  res.json({ points: user?.points || 0 });
});

export const getGamification = asyncHandler(async (req, res) => {
  const [user, achievements] = await Promise.all([
    User.findById(req.user._id).select("points name email"),
    Achievement.find({ user: req.user._id }).sort({ createdAt: -1 })
  ]);

  res.json({ user, achievements });
});

import User from "../models/User.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, targetExam } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { ...(name ? { name } : {}), ...(targetExam ? { targetExam } : {}) } },
    { new: true }
  ).select("-password");

  res.json(user);
});

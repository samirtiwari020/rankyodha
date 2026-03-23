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

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error("Incorrect current password");
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

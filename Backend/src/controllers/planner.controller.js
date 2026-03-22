import StudyPlan from "../models/StudyPlan.js";
import { generateStudyPlan } from "../services/planner.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const createPlan = asyncHandler(async (req, res) => {
  const { title, examDate, topics } = req.body;
  if (!title) {
    res.status(400);
    throw new Error("Plan title is required");
  }

  const plan = await generateStudyPlan({
    userId: req.user._id,
    title,
    examDate,
    topics: Array.isArray(topics) ? topics : []
  });

  res.status(201).json(plan);
});

export const getMyPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(plans);
});

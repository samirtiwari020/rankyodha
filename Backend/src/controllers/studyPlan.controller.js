import { asyncHandler } from "../middleware/error.middleware.js";
import { generateStudyPlan } from "../services/studyPlan.service.js";

export const generateMockStudyPlan = asyncHandler(async (req, res) => {
  const { exam, daysLeft, dailyHours, weakTopics } = req.body;
  const plan = generateStudyPlan({ exam, daysLeft, dailyHours, weakTopics });

  res.status(200).json({
    success: true,
    message: "Mock study plan generated successfully",
    plan,
  });
});

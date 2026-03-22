import { askAI } from "../services/ai.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const solveDoubt = asyncHandler(async (req, res) => {
  const { question, context = "" } = req.body;
  if (!question) {
    res.status(400);
    throw new Error("Question is required");
  }

  const prompt = `You are a tutor. Explain this doubt clearly with steps. Context: ${context}\nDoubt: ${question}`;
  const answer = await askAI(prompt, "This is a fallback explanation: break the problem into smaller steps and verify fundamentals first.");

  res.json({ answer });
});

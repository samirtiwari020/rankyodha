import { asyncHandler } from "../middleware/error.middleware.js";
import { askAI } from "../services/ai.service.js";

const parseJsonFromAI = (text, fallback) => {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
};

export const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const { role = "UPSC IAS", topic = "General Knowledge" } = req.body || {};

  const fallback = {
    questions: [
      `Why do you want to join the ${role} service?`,
      `How would you handle an ethical conflict in administrative duty?`,
      `What are key challenges in ${topic} and how would you address them?`
    ]
  };

  const prompt = `Generate exactly 3 interview questions for role ${role} on topic ${topic}. Return valid JSON: {"questions": ["q1", "q2", "q3"]}.`;
  const aiText = await askAI(prompt, JSON.stringify(fallback));
  const payload = parseJsonFromAI(aiText, fallback);

  res.json({ questions: Array.isArray(payload.questions) ? payload.questions.slice(0, 3) : fallback.questions });
});

export const evaluateInterview = asyncHandler(async (req, res) => {
  const { role = "UPSC IAS", qaPairs = [] } = req.body || {};

  const fallback = {
    overallScore: 72,
    strengths: ["Structured responses", "Balanced reasoning"],
    areasForImprovement: ["Add specific examples", "Improve conciseness"],
    detailedFeedback: qaPairs.map((pair, idx) => ({
      question: pair.question || `Question ${idx + 1}`,
      feedback: "Answer is directionally correct but needs more concrete evidence.",
      idealApproach: "Use a clear framework, cite one real-world example, and conclude with impact."
    })),
    finalVerdict: `Good potential for ${role}. Focus on examples and policy-level clarity.`
  };

  const prompt = `Evaluate this interview for ${role}. QA pairs: ${JSON.stringify(
    qaPairs
  )}. Return ONLY valid JSON with keys: overallScore (0-100 number), strengths (string[]), areasForImprovement (string[]), detailedFeedback ({question, feedback, idealApproach}[]), finalVerdict (string).`;

  const aiText = await askAI(prompt, JSON.stringify(fallback));
  const payload = parseJsonFromAI(aiText, fallback);

  const normalized = {
    overallScore:
      typeof payload.overallScore === "number"
        ? Math.max(0, Math.min(100, payload.overallScore))
        : fallback.overallScore,
    strengths: Array.isArray(payload.strengths) ? payload.strengths : fallback.strengths,
    areasForImprovement: Array.isArray(payload.areasForImprovement)
      ? payload.areasForImprovement
      : fallback.areasForImprovement,
    detailedFeedback: Array.isArray(payload.detailedFeedback)
      ? payload.detailedFeedback
      : fallback.detailedFeedback,
    finalVerdict: typeof payload.finalVerdict === "string" ? payload.finalVerdict : fallback.finalVerdict
  };

  res.json(normalized);
});
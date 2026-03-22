import pdfParse from "pdf-parse";
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

export const generateOnePager = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("PDF document is required");
  }

  const parsed = await pdfParse(req.file.buffer);
  const rawText = (parsed.text || "").replace(/\s+/g, " ").trim();
  const snippet = rawText.slice(0, 6000);

  const fallback = {
    title: "Quick Revision Sheet",
    keyConcepts: ["Core idea 1", "Core idea 2", "Core idea 3"],
    importantFormulas: [{ name: "Primary relation", equation: "a = b + c" }],
    weaknessAreasToFocus: ["Revise definitions", "Practice numerical questions"],
    quickSummary: "Concise revision summary generated in fallback mode."
  };

  const prompt = `From the following study material excerpt, create a one-page revision JSON with keys title, keyConcepts(string[]), importantFormulas({name,equation}[]), weaknessAreasToFocus(string[]), quickSummary(string). Excerpt: ${snippet}`;
  const aiText = await askAI(prompt, JSON.stringify(fallback));
  const payload = parseJsonFromAI(aiText, fallback);

  res.json({
    title: typeof payload.title === "string" ? payload.title : fallback.title,
    keyConcepts: Array.isArray(payload.keyConcepts) ? payload.keyConcepts : fallback.keyConcepts,
    importantFormulas: Array.isArray(payload.importantFormulas)
      ? payload.importantFormulas
      : fallback.importantFormulas,
    weaknessAreasToFocus: Array.isArray(payload.weaknessAreasToFocus)
      ? payload.weaknessAreasToFocus
      : fallback.weaknessAreasToFocus,
    quickSummary: typeof payload.quickSummary === "string" ? payload.quickSummary : fallback.quickSummary
  });
});
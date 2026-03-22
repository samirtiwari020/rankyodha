import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

export const askAI = async (prompt, fallbackText = "No AI response available") => {
  if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY.includes("your")) {
    return fallbackText;
  }

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return fallbackText;
  }
};

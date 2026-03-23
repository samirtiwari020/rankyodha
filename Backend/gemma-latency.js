import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';

dotenv.config({ path: path.resolve('./.env') });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const prompt = `You are an expert study planner. Create a highly effective, structured, and realistic study plan.
Details:
- Exam: JEE
- Time remaining: 90 days
- Daily study time: 4 hours
- Weak topics to prioritize: Physics, Optics

Guidelines:
1. Prioritize the weak topics.
2. Include dedicated time for revision.
3. Include dedicated time for practice.
4. Keep the plan realistic and manageable within the daily study hours limit.

Output exactly and ONLY valid JSON matching this structure. Do not include markdown formatting, backticks, or any extra text:
{
  "plan": [
    {
      "day": number,
      "tasks": [
        {
          "topic": string,
          "type": "learn" | "revise" | "practice",
          "hours": number,
          "reason": string
        }
      ]
    }
  ]
}`;

async function testGemma() {
  const start = Date.now();
  try {
    const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const time = Date.now() - start;
    fs.writeFileSync('gemma-latency.json', JSON.stringify({ success: true, text: response.text(), timeMs: time }, null, 2));
    console.log("Done");
  } catch (e) {
    fs.writeFileSync('gemma-latency.json', JSON.stringify({ success: false, error: e.message }, null, 2));
    console.log("Failed");
  }
}
testGemma();

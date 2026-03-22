import fs from "fs";
import path from "path";
import { extractQuestionsFromPdf } from "./src/services/questionExtraction.service.js";

async function run() {
  const filePath = path.join("./document", "question-bank.pdf");
  const buffer = fs.readFileSync(filePath);
  const { questions } = await extractQuestionsFromPdf(buffer, "question-bank.pdf");

  const mcqs = questions.filter(q => q.isValid && q.questionType === "MCQ").slice(0, 3);
  console.log(JSON.stringify(mcqs, null, 2));
}

run().catch(console.error);

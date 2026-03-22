import fs from "fs";
import { extractQuestionsFromPdf } from "./src/services/questionExtraction.service.js";

async function run() {
  const buffer = fs.readFileSync("./document/question-bank.pdf");
  const { questions } = await extractQuestionsFromPdf(buffer, "question-bank.pdf");
  
  const mcqs = questions.filter(q => q.questionType === "MCQ" && q.options.length === 4);
  const withAnswers = questions.filter(q => q.correctAnswer !== null);

  console.log(`Total Extractions: ${questions.length}`);
  console.log(`Valid MCQs (4 options): ${mcqs.length}`);
  console.log(`Questions with Mapped Answers: ${withAnswers.length}`);

  if (mcqs.length > 0) {
    console.log(`\nSample Mapped MCQ: Q${mcqs[0].questionNumber}`);
    console.log(`Options: ${mcqs[0].options.join(" | ")}`);
    console.log(`Correct Answer: ${mcqs[0].correctAnswer}`);
  }
}

run().catch(console.error);

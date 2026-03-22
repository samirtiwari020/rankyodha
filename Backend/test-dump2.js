import fs from "fs";
import { extractQuestionsFromPdf } from "./src/services/questionExtraction.service.js";

async function run() {
  const buffer = fs.readFileSync("./document/question-bank.pdf");
  const { questions } = await extractQuestionsFromPdf(buffer, "question-bank.pdf");
  console.log("Questions length:", questions.length);
  console.log(JSON.stringify(questions, null, 2));
}
run();

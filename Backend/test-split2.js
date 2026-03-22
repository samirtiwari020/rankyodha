import fs from "fs";
import { extractQuestionsFromPdf } from "./src/services/questionExtraction.service.js";

async function run() {
  const buffer = fs.readFileSync("./document/question-bank.pdf");
  const { questions } = await extractQuestionsFromPdf(buffer, "question-bank.pdf");
  console.log(`Total questions returned: ${questions.length}`);
}
run();

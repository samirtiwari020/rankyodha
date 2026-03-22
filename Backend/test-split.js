import fs from "fs";
import { extractQuestionsFromPdf } from "./src/services/questionExtraction.service.js";

async function run() {
  const text = fs.readFileSync("pdf-raw-dump.txt", "utf8");
  // Simulate the splitQuestions directly
  const questionRegex = /(?:^|\n)\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,4})\s*[).:\-]\s+([\s\S]*?)(?=(?:\n?\s*(?:Q(?:uestion)?\.?\s*)?\d{1,4}\s*[).:\-]\s+)|$)/gi;
  
  let match;
  let qRegexCount = 0;
  while ((match = questionRegex.exec(text)) !== null) {
    qRegexCount++;
    if (qRegexCount === 1) console.log("First match length:", match[2].length);
  }
  console.log("Regex matches:", qRegexCount);

  // If 0, why? Let's check the first lookahead
  const singleMatch = /(?:^|\n)\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,4})\s*[).:\-]\s+/.exec(text);
  console.log("Single match:", singleMatch ? singleMatch[0] : "None");
}
run();

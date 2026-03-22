import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

async function run() {
  const filePath = path.join("./document", "question-bank.pdf");
  const buffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(buffer);
  
  // Write the text to a file so we can read it easily
  fs.writeFileSync("pdf-raw-dump.txt", parsed.text);
  console.log("Dumped to pdf-raw-dump.txt");
}

run().catch(console.error);

import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

async function run() {
  const filePath = path.join("./document", "question-bank.pdf");
  const fileBuffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(fileBuffer);
  const text = parsed.text || "";
  console.log(text.slice(-1000));
}
run().catch(console.error);

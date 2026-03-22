import fs from "fs";

async function run() {
  const text = fs.readFileSync("pdf-raw-dump.txt", "utf8");
  const regex = /(?:^|\n)\s*(?!\()\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,4})\s*[).:\-]\s+([\s\S]*?)(?=(?:\n\s*(?!\()\s*(?:Q(?:uestion)?\.?\s*)?\d{1,4}\s*[).:\-]\s+)|$)/gi;
  
  let match;
  let qRegexCount = 0;
  while ((match = regex.exec(text)) !== null) {
    qRegexCount++;
    if (qRegexCount <= 3) {
      console.log(`\n--- Match ${qRegexCount}: Q${match[1]} ---`);
      console.log(match[2].substring(0, 150) + "...");
    }
  }
  console.log("\nRegex matches:", qRegexCount);
}
run();

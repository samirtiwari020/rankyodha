import fs from "fs";

async function run() {
  const text = fs.readFileSync("pdf-raw-dump.txt", "utf8");
  const regex = /(?:^|\n)\s*(?!\()\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,4})\s*[).:\-]\s+([\s\S]*?)(?=(?:\n\s*(?!\()\s*(?:Q(?:uestion)?\.?\s*)?\d{1,4}\s*[).:\-]\s+)|$)/gi;
  
  let match;
  let count = 0;
  while ((match = regex.exec(text)) !== null) {
    count++;
  }
  console.log("Total regex matches with negative lookahead:", count);
}
run();

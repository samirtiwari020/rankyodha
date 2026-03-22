import fs from "fs";

async function run() {
  const text = fs.readFileSync("pdf-raw-dump.txt", "utf8");
  const regex = /(?:^|\n)\s*(?!\()\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,4})\s*[).:\-]\s+([\s\S]*?)(?=(?:\n\s*(?!\()\s*(?:Q(?:uestion)?\.?\s*)?\d{1,4}\s*[).:\-]\s+)|$)/gi;
  
  let match;
  const nums = [];
  while ((match = regex.exec(text)) !== null) {
    nums.push(match[1]);
  }
  console.log("Found nums:", nums.slice(0, 50).join(", "));
}
run();

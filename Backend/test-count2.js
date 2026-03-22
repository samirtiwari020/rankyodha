import fs from "fs";

async function run() {
  const text = fs.readFileSync("pdf-raw-dump.txt", "utf8");
  
  // Strict regex requiring Q or Question
  const questionRegex = /(?:^|\n)\s*(?:Q|Question)\.?\s*(\d{1,4})\s*[).:\-]\s+([\s\S]*?)(?=(?:\n\s*(?:Q|Question)\.?\s*\d{1,4}\s*[).:\-]\s+)|$)/gi;
  
  let match;
  const nums = [];
  while ((match = questionRegex.exec(text)) !== null) {
    nums.push(match[1]);
  }
  console.log("Strict matches:", nums.length);
  if (nums.length > 0) {
    console.log("First 5:", nums.slice(0, 5).join(", "));
    console.log("Last 5:", nums.slice(-5).join(", "));
  }
}
run();

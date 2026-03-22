import fs from "fs";

async function run() {
  const text = fs.readFileSync("pdf-raw-dump.txt", "utf8");
  const regex = /(?:^|\n)\s*(?:Q(?:uestion)?\.?\s*)?(\d{1,4})\s*[).:\-]\s+([\s\S]*?)(?=(?:\n?\s*(?:Q(?:uestion)?\.?\s*)?\d{1,4}\s*[).:\-]\s+)|$)/gi;
  
  let match;
  let count = 0;
  while ((match = regex.exec(text)) !== null) {
    count++;
    if (count <= 20) {
      console.log(`\n--- Match ${count}: Num=${match[1]} ---`);
      console.log(match[0].substring(0, 100).replace(/\n/g, "\\n"));
    }
  }
}
run();

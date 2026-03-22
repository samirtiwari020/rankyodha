import fs from "fs";

async function run() {
  const text = fs.readFileSync("pdf-raw-dump.txt", "utf8");
  const ansStart = text.indexOf("1. ("); 
  if (ansStart !== -1) {
    console.log("Found '1. (' at", ansStart);
    console.log(text.substring(ansStart - 200, ansStart + 200));
  } else {
    // try to find where the key starts
    const match = /(?:Answer|Key|Answers)\s*\n/i.exec(text);
    if (match) {
       console.log("Found match:", match[0], "at", match.index);
       console.log(text.substring(match.index - 100, match.index + 200));
    } else {
       console.log("Could not easily find answer key start.");
    }
  }
}
run();

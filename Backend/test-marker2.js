import fs from "fs";

async function run() {
  const text = fs.readFileSync("pdf-raw-dump.txt", "utf8");
  const markerRegex = /(answer\s*key|answers\s*[:\-]?|solutions?\s*[:\-]?|key\s*[:\-]?)/gi;
  let markerMatch;
  const indices = [];

  while ((markerMatch = markerRegex.exec(text)) !== null) {
    indices.push({ match: markerMatch[0], index: markerMatch.index });
  }

  console.log(`Text length: ${text.length}`);
  console.log(`Total markers found: ${indices.length}`);
  if (indices.length > 0) {
    const last = indices[indices.length - 1];
    console.log(`Last marker: "${last.match}" at ${last.index}`);
    console.log("Text around last marker:");
    console.log(text.substring(Math.max(0, last.index - 50), Math.min(text.length, last.index + 150)));
  }
}
run();

import fs from "fs";

async function run() {
  const text = fs.readFileSync("pdf-raw-dump.txt", "utf8");
  const markerRegex = /(answer\s*key|answers\s*[:\-]?|solutions?\s*[:\-]?|key\s*[:\-]?)/gi;
  let markerMatch;
  let lastMarkerIndex = -1;

  while ((markerMatch = markerRegex.exec(text)) !== null) {
    console.log(`Marker at ${markerMatch.index}: ${markerMatch[0]}`);
    lastMarkerIndex = markerMatch.index;
  }
  console.log(`Last marker index: ${lastMarkerIndex}, Text length: ${text.length}`);
  if (lastMarkerIndex !== -1) {
      console.log("Text around last marker:");
      console.log(text.substring(Math.max(0, lastMarkerIndex - 100), Math.min(text.length, lastMarkerIndex + 300)));
  }
}
run();

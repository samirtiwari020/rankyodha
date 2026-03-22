import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

async function analyzePdfContent() {
  const docsDir = "./document";
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith(".pdf")).slice(0, 1);

  if (files.length === 0) {
    console.log("No PDFs found");
    return;
  }

  const file = files[0];
  const filePath = path.join(docsDir, file);
  const fileBuffer = fs.readFileSync(filePath);
  const parsed = await pdfParse(fileBuffer);
  const rawText = (parsed.text || "").trim();

  console.log("📄 File:", file);
  console.log(`Total length: ${rawText.length} chars\n`);

  // Check for answer marker
  const markerRegex = /(answer\s*key|answers\s*[:\-]?|solutions?\s*[:\-]?|key\s*[:\-]?)/gi;
  let markerMatch;
  let lastMarkerIndex = -1;

  while ((markerMatch = markerRegex.exec(rawText)) !== null) {
    console.log(`Found marker at ${markerMatch.index}: "${markerMatch[0]}"`);
    lastMarkerIndex = markerMatch.index;
  }

  if (lastMarkerIndex > 0) {
    console.log(`\n✅ Answer section found at position ${lastMarkerIndex}\n`);
    console.log("Answer section content (first 500 chars):");
    console.log(rawText.slice(lastMarkerIndex, lastMarkerIndex + 500));
    
    // Try to parse answers
    const answerSection = rawText.slice(lastMarkerIndex);
    const answerRegex = /(\d{1,4})\s*[).:\-]?\s*([A-D])\b/gi;
    let match;
    let count = 0;
    console.log("\n📊 Parsed answers:");
    while ((match = answerRegex.exec(answerSection)) !== null && count < 10) {
      console.log(`   Q${match[1]}: ${match[2]}`);
      count++;
    }
  } else {
    console.log("❌ No answer section found in PDF");
  }
}

analyzePdfContent().catch(e => console.error(e));

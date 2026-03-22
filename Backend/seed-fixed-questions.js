import { connectDB } from "./src/config/db.js";
import Question from "./src/models/Question.js";
import { importQuestionsFromDocumentFolder } from "./src/services/adaptiveLearning.service.js";
import path from "path";
import mongoose from "mongoose";

async function run() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    
    console.log("Deleting all existing questions...");
    const delRes = await Question.deleteMany({});
    console.log(`Deleted ${delRes.deletedCount} old questions.`);

    console.log("Starting extraction process...");
    const folderPath = path.resolve(process.cwd(), "document");
    
    const stats = await importQuestionsFromDocumentFolder(folderPath);
    console.log("\n--- Extraction & Import Complete ---");
    console.log("Imported Files:", stats.importedFiles);
    console.log(`Extracted Count: ${stats.extractedCount}`);
    console.log(`Stored Count: ${stats.storedCount}`);
    console.log(`Skipped Count: ${stats.skippedCount}`);
    console.log(`Filtered Count: ${stats.filteredCount}`);

  } catch (err) {
    console.error("Error during process:", err);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

run();

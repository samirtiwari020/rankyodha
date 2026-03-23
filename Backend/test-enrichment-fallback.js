import mongoose from "mongoose";
import { config } from "dotenv";
import { enrichQuestionWithGeneratedOptions } from "./src/services/questionEnrichment.service.js";

config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://samirtiwari020_db_user:rWB7bYPG9X7UF6cR@cluster0.tzb57y7.mongodb.net/samirtiwari020_db?retryWrites=true&w=majority";

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Import Question model
    const { default: Question } = await import("./src/models/Question.js");

    // Fetch a sample MCQ question with no options
    const question = await Question.findOne({
      questionType: "MCQ",
      options: { $size: 0 },
      correctAnswer: { $exists: true }
    }).limit(1);

    if (!question) {
      console.log("❌ No MCQ question with empty options found");
      process.exit(1);
    }

    console.log("📝 Original Question:");
    console.log(`   Topic: ${question.topic}`);
    console.log(`   Question: ${question.question.substring(0, 80)}...`);
    console.log(`   Correct Answer: ${question.correctAnswer}`);
    console.log(`   Options before enrichment: ${question.options.length}`);

    console.log("\n🔄 Enriching question...");
    const enriched = await enrichQuestionWithGeneratedOptions(question.toObject());

    console.log("\n📝 Enriched Question:");
    console.log(`   Options after enrichment: ${enriched.options.length}`);
    console.log(`   Generation method: ${enriched._generationMethod}`);
    console.log(`   Options: ${JSON.stringify(enriched.options)}`);
    console.log(`   ✅ Enrichment successful!`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();

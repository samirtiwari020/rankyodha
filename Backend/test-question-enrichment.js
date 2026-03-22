import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import { getAdaptiveNextQuestion } from "./src/services/adaptiveLearning.service.js";
import { enrichQuestionWithGeneratedOptions } from "./src/services/questionEnrichment.service.js";

const testUserId = "69bff4d5fc32d015d667cb9a";

const testQuestionFetching = async () => {
  console.log("🧪 TESTING QUESTION FETCHING WITH ENRICHMENT\n");

  try {
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Get a Math question
    console.log("📝 Fetching Math question...");
    const result = await getAdaptiveNextQuestion({
      userId: testUserId,
      subject: "Math"
    });

    console.log(`   Topic: ${result.topic}`);
    console.log(`   Difficulty: ${result.recommendedDifficulty}`);
    console.log(`   Question: ${result.question?.question?.substring(0, 80)}...`);
    console.log(`   Options before enrichment: ${result.question?.options?.length || 0}`);

    // Enrich the question
    console.log("\n🔄 Enriching question with generated options...");
    const enriched = await enrichQuestionWithGeneratedOptions(result.question);

    console.log(`   Options after enrichment: ${enriched.options?.length || 0}`);
    if (enriched._optionsGenerated) {
      console.log(`   ✅ Options were GENERATED (not from DB)`);
    } else if (enriched.options?.length > 0) {
      console.log(`   ✅ Options were from database`);
    } else {
      console.log(`   ⚠️ Options still empty`);
    }

    if (enriched.options?.length > 0) {
      console.log("\n   Generated/Stored Options:");
      enriched.options.forEach((opt, i) => {
        const letter = ["A", "B", "C", "D"][i];
        console.log(`   ${letter}. ${opt.substring(0, 50)}${opt.length > 50 ? "..." : ""}`);
      });
    }

    console.log(`\n   Correct Answer: ${enriched.correctAnswer}`);

    console.log("\n✅ Test complete!");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
};

testQuestionFetching();

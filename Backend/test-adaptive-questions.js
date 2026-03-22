import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Question from "./src/models/Question.js";
import UserPerformance from "./src/models/UserPerformance.js";
import UserAttempt from "./src/models/UserAttempt.js";
import { connectDB } from "./src/config/db.js";
import { getAdaptiveNextQuestion } from "./src/services/adaptiveLearning.service.js";

const testUserId = "69bff4d5fc32d015d667cb9a";

const runDiagnostics = async () => {
  console.log("🔍 ADAPTIVE LEARNING DIAGNOSTICS\n");

  try {
    // 1. Check MongoDB connection
    console.log("1️⃣ Testing MongoDB connection...");
    await connectDB();
    console.log("✅ MongoDB connected\n");

    // 2. Count questions by subject
    console.log("2️⃣ Checking questions by subject...");
    const subjects = await Question.distinct("subject", { isValid: true });
    console.log(`   Found subjects: ${subjects.join(", ")}\n`);

    for (const subject of subjects) {
      const count = await Question.countDocuments({ isValid: true, subject });
      console.log(`   ${subject}: ${count} questions`);
    }
    console.log();

    // 3. Sample questions from each subject
    console.log("3️⃣ Sample questions from each subject:");
    for (const subject of subjects) {
      const sample = await Question.findOne({ isValid: true, subject }).lean();
      if (sample) {
        console.log(`\n   ${subject}:`);
        console.log(`   - Question: ${sample.question?.substring(0, 80)}...`);
        console.log(`   - Topic: ${sample.topic}`);
        console.log(`   - Difficulty: ${sample.difficulty}`);
        console.log(`   - Options: ${sample.options?.length || 0}`);
      }
    }
    console.log();

    // 4. Check user performance data
    console.log("4️⃣ Checking user performance data...");
    const perfCount = await UserPerformance.countDocuments({ userId: testUserId });
    console.log(`   Performance records for test user: ${perfCount}`);
    
    if (perfCount > 0) {
      const perf = await UserPerformance.findOne({ userId: testUserId }).lean();
      console.log(`   Sample: ${perf.subject} - ${perf.topic}: ${perf.accuracy}%`);
    }
    console.log();

    // 5. Test adaptive next question for each subject
    console.log("5️⃣ Testing adaptive next question logic...");
    for (const subject of subjects) {
      try {
        const result = await getAdaptiveNextQuestion({
          userId: testUserId,
          subject
        });
        
        console.log(`\n   ${subject}:`);
        console.log(`   - Recommended difficulty: ${result.recommendedDifficulty}`);
        console.log(`   - Selected topic: ${result.topic || "No topic data"}`);
        console.log(`   - Question returned: ${result.question ? "✅ YES" : "❌ NO"}`);
        console.log(`   - Confidence score: ${result.confidenceScore}`);
        console.log(`   - Current streak: ${result.currentStreak}`);
        
        if (result.question) {
          console.log(`   - Question preview: ${String(result.question.question).substring(0, 60)}...`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    console.log();

    // 6. Check question fields
    console.log("6️⃣ Checking question document structure...");
    const sampleQ = await Question.findOne({ isValid: true }).lean();
    if (sampleQ) {
      console.log("   Fields in question document:");
      Object.keys(sampleQ).forEach(key => {
        const val = sampleQ[key];
        const type = Array.isArray(val) ? `Array[${val.length}]` : typeof val;
        console.log(`   - ${key}: ${type}`);
      });
    }
    console.log();

    console.log("✅ Diagnostic complete!");
    
  } catch (error) {
    console.error("❌ Error during diagnostics:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
  }
};

runDiagnostics();

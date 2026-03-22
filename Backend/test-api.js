import mongoose from "mongoose";
import { fetchPracticeQuestions } from "./src/services/adaptiveLearning.service.js";
import dotenv from "dotenv";

dotenv.config();

async function testAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URL || process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Test fetchPracticeQuestions
    const questions = await fetchPracticeQuestions({
      topicOrSubject: "Math",
      difficulty: "Medium",
      limit: 3,
      includeAnswers: true
    });

    console.log("📚 Practice Questions API Response:");
    console.log(JSON.stringify(questions, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

testAPI();

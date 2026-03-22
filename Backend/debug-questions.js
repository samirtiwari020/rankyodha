import mongoose from "mongoose";
import Question from "./src/models/Question.js";
import dotenv from "dotenv";

dotenv.config();

async function debugQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URL || process.env.MONGO_URI);

    // Get MCQ question with full details
    const mcqWithOptions = await Question.findOne({
      questionType: "MCQ",
      options: {$exists: true, $ne: []}
    }).lean();

    if (mcqWithOptions) {
      console.log("✅ MCQ with options found:");
      console.log(JSON.stringify(mcqWithOptions, null, 2));
    } else {
      console.log("❌ No MCQ questions with options found\n");

      // Get any MCQ
      const anyMCQ = await Question.findOne({questionType: "MCQ"}).lean();
      if (anyMCQ) {
        console.log("📝 Sample MCQ (without options):");
        console.log(JSON.stringify(anyMCQ, null, 2));
      }
    }

    // Check if there's data extraction issue
    const mcqCount = await Question.countDocuments({questionType: "MCQ"});
    const mcqWithOpts = await Question.countDocuments({
      questionType: "MCQ",
      options: {$exists: true, $type: "array", $ne: []}
    });

    console.log(`\n📊 MCQ Statistics:`);
    console.log(`   Total MCQ: ${mcqCount}`);
    console.log(`   MCQ with options: ${mcqWithOpts}`);

    // Check numerical
    const numSample = await Question.findOne({questionType: "Numerical", answer: {$exists: true}}).lean();
    if (numSample) {
      console.log("\n📐 Sample Numerical:");
      console.log(`   Question: ${numSample.question.substring(0, 80)}...`);
      console.log(`   Answer: ${numSample.answer}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

debugQuestions();

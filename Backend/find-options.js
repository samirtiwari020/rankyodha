import mongoose from "mongoose";
import Question from "./src/models/Question.js";
import dotenv from "dotenv";

dotenv.config();

async function findQuestionsWithOptions() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URL || process.env.MONGO_URI);

    // Count MCQ with options
    const mcqWithOpts = await Question.countDocuments({
      questionType: "MCQ",
      options: {$exists: true, $elemMatch: {$ne: ""}}
    });

    console.log(`MCQ with non-empty options: ${mcqWithOpts}\n`);

    // Get first MCQ with options
    const firstWithOpts = await Question.findOne({
      questionType: "MCQ",
      options: {$exists: true, $elemMatch: {$ne: ""}}
    }).lean();

    if (firstWithOpts) {
      console.log("✅ Found MCQ with options:");
      console.log(`   Question: ${firstWithOpts.question.substring(0, 100)}`);
      console.log(`   Options (${firstWithOpts.options.length}):`);
      firstWithOpts.options.forEach((opt, i) => {
        console.log(`     ${i+1}. ${opt}`);
      });
      console.log(`   Correct Answer: ${firstWithOpts.correctAnswer}`);
    } else {
      console.log("❌ No MCQ with options found");
      
      // Get any MCQ to see structure
      const anyMCQ = await Question.findOne({questionType: "MCQ"}).lean();
      if (anyMCQ) {
        console.log("\nSample MCQ without options:");
        console.log(`   question: ${anyMCQ.question.substring(0, 100)}`);
        console.log(`   options: ${JSON.stringify(anyMCQ.options)}`);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

findQuestionsWithOptions();

import mongoose from "mongoose";
import Question from "./src/models/Question.js";
import dotenv from "dotenv";

dotenv.config();

async function inspectQuestions() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URL || process.env.MONGO_URI);

    // Get MCQ with 0 options
    const noOpts = await Question.findOne({ questionType: "MCQ", options: [] }).lean();
    if (noOpts) {
      console.log("📋 MCQ with 0 options:");
      console.log(`ID: ${noOpts._id}`);
      console.log(`Full question text (first 400 chars):`);
      console.log(noOpts.question.substring(0, 400));
      console.log("\n");
    }

    // Get MCQ with options
    const withOpts = await Question.findOne({ questionType: "MCQ", options: {$ne: []} }).lean();
    if (withOpts) {
      console.log("📋 MCQ with options:");
      console.log(`ID: ${withOpts._id}`);
      console.log(`Stored options:`);
      withOpts.options.forEach((opt, i) => {
        console.log(`  ${i+1}. ${opt.substring(0, 80)}`);
      });
      console.log(`\nFull question text (first 400 chars):`);
      console.log(withOpts.question.substring(0, 400));
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

inspectQuestions();

import mongoose from "mongoose";
import Question from "./src/models/Question.js";
import dotenv from "dotenv";

dotenv.config();

async function analyzePDFFormat() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URL || process.env.MONGO_URI);

    // Get 5 MCQ questions to see the format
    const mcqQuestions = await Question.find({questionType: "MCQ"}).limit(5).lean();
    const numQuestions = await Question.find({questionType: "Numerical"}).limit(3).lean();

    console.log("📝 MCQ QUESTION FORMATS:\n");
    mcqQuestions.forEach((q, i) => {
      console.log(`${i+1}. Pattern Analysis:`);
      console.log(`   Full Text: "${q.question}"`);
      
      // Look for patterns
      const hasOptionsPattern1 = /\((1)\).*\((2)\).*\((3)\).*\((4)\)/;
      const hasOptionsPattern2 = /\(A\).*\(B\).*\(C\).*\(D\)/;
      const hasOptionsPattern3 = /\s\(A\)\s.*\(B\)\s.*\(C\)\s.*\(D\)\s/;
      
      console.log(`   Has (1)(2)(3)(4)?: ${hasOptionsPattern1.test(q.question)}`);
      console.log(`   Has (A)(B)(C)(D)?: ${hasOptionsPattern2.test(q.question)}`);
      console.log(`   Has (A) (B) (C) (D)?: ${hasOptionsPattern3.test(q.question)}`);
      console.log(`   Options stored: ${q.options?.length || 0}`);
      console.log();
    });

    console.log("\n📐 NUMERICAL QUESTION FORMATS:\n");
    numQuestions.forEach((q, i) => {
      console.log(`${i+1}. Pattern Analysis:`);
      console.log(`   Full Text: "${q.question}"`);
      console.log(`   Answer stored: ${q.answer || "null"}`);
      console.log();
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

analyzePDFFormat();

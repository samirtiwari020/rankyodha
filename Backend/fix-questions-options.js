import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Question from "./src/models/Question.js";
import { connectDB } from "./src/config/db.js";
import { askAI } from "./src/services/ai.service.js";

const fixQuestionsWithoutOptions = async () => {
  console.log("🔧 FIXING QUESTIONS WITHOUT OPTIONS\n");

  try {
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Find MCQ questions without options
    const brokenMCQs = await Question.find({
      questionType: "MCQ",
      isValid: true,
      $or: [
        { options: { $size: 0 } },
        { options: { $exists: false } }
      ]
    }).limit(50);

    console.log(`Found ${brokenMCQs.length} MCQ questions without options\n`);

    if (brokenMCQs.length === 0) {
      console.log("No broken MCQ questions found!");
      await mongoose.disconnect();
      return;
    }

    let fixedCount = 0;
    let errorCount = 0;

    for (const question of brokenMCQs) {
      try {
        console.log(`\nProcessing: ${question.question.substring(0, 60)}...`);

        // Ask Gemini to generate plausible options for this question
        const prompt = `You are an expert exam question writer. Given this ${question.topic} ${question.subject} question at ${question.difficulty} level, generate 4 plausible multiple choice options (A, B, C, D).

Question: ${question.question}

Return ONLY a valid JSON object with this exact structure (no markdown):
{
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctAnswerIndex": 0
}

The correctAnswerIndex should be 0-3 (A-D).`;

        const response = await askAI(prompt);
        
        try {
          // Extract JSON from response (it might contain markdown)
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);

          if (Array.isArray(parsed.options) && parsed.options.length === 4) {
            const correctLetter = ["A", "B", "C", "D"][parsed.correctAnswerIndex || 0];

            await Question.findByIdAndUpdate(
              question._id,
              {
                options: parsed.options,
                correctAnswer: correctLetter,
                isValid: true
              },
              { new: true }
            );

            console.log(`  ✅ Fixed with options and answer: ${correctLetter}`);
            fixedCount++;
          } else {
            throw new Error("Invalid options in response");
          }
        } catch (parseError) {
          console.log(`  ⚠️ Failed to parse AI response: ${parseError.message}`);
          console.log(`  Response was: ${response.substring(0, 100)}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
        errorCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n\n📊 SUMMARY:`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Errors: ${errorCount}`);

    // Display updated stats
    const stats = await Question.aggregate([
      { $match: { isValid: true } },
      { $group: {
          _id: "$questionType",
          count: { $sum: 1 },
          withOptions: {
            $sum: { $cond: [{ $gt: [{ $size: "$options" }, 0] }, 1, 0] }
          }
        }
      }
    ]);

    console.log(`\n📈 Updated question stats:`);
    for (const stat of stats) {
      console.log(`   ${stat._id}: ${stat.count} total, ${stat.withOptions} with options`);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

fixQuestionsWithoutOptions();

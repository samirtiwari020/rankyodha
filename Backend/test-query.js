import mongoose from "mongoose";
import Question from "./src/models/Question.js";
import dotenv from "dotenv";

dotenv.config();

async function testQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URL || process.env.MONGO_URI);

    // Check difficulties
    const difficulties = await Question.aggregate([
      { $match: { isValid: true } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } }
    ]);

    console.log("📊 Difficulties in database:");
    difficulties.forEach(d => console.log(`   ${d._id}: ${d.count}`));

    // Try with Medium difficulty
    const query = { isValid: true };
    const pattern = new RegExp(`^Math$`, "i");
    query.$or = [{ topic: pattern }, { subject: pattern }];
    query.difficulty = new RegExp(`^Medium$`, "i");

    const questions = await Question.find(query)
      .select("-correctAnswer -answer")
      .limit(5)
      .lean();

    console.log(`\n✅ Questions with Math + Medium: ${questions.length}`);
    if (questions.length > 0) {
      console.log("Sample:");
      questions.forEach((q, i) => {
        console.log(`  ${i+1}. options: ${q.options.length} | type: ${q.questionType}`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testQuery();

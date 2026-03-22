import mongoose from "mongoose";
import Question from "./src/models/Question.js";
import dotenv from "dotenv";

dotenv.config();

async function checkTopics() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URL || process.env.MONGO_URI);

    const difficulties = await Question.aggregate([
      { $match: { isValid: true } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log("📊 Difficulties:");
    difficulties.forEach(d => console.log(`   ${d._id}: ${d.count}`));

    const topics = await Question.aggregate([
      { $match: { isValid: true } },
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log("\n📚 Topics:");
    topics.forEach(t => console.log(`   ${t._id}: ${t.count}`));

    // MCQ stats
    const mcqWithOpts = await Question.countDocuments({
      questionType: "MCQ",
      options: {$exists: true, $elemMatch: {$ne: ""}}
    });
    
    const mcqTotal = await Question.countDocuments({ questionType: "MCQ" });

    console.log(`\n💾 MCQ with options: ${mcqWithOpts}/${mcqTotal}`);

    const totalCount = await Question.countDocuments({ isValid: true });
    console.log(`📕 Total valid questions: ${totalCount}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkTopics();

import mongoose from "mongoose";
import Question from "./src/models/Question.js";
import dotenv from "dotenv";

dotenv.config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_ATLAS_URL || process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Count all questions
    const totalCount = await Question.countDocuments();
    const validCount = await Question.countDocuments({ isValid: true });
    const invalidCount = await Question.countDocuments({ isValid: false });

    console.log("📊 Question Statistics:");
    console.log(`   Total Questions: ${totalCount}`);
    console.log(`   Valid Questions: ${validCount}`);
    console.log(`   Invalid/Junk: ${invalidCount}\n`);

    // Check types
    const byType = await Question.aggregate([
      {$group: {_id: "$questionType", count: {$sum: 1}}}
    ]);
    console.log("📋 Questions by Type:");
    byType.forEach(t => console.log(`   ${t._id || "unknown"}: ${t.count}`));

    // Check topics
    const topTopics = await Question.aggregate([
      {$match: {isValid: true}},
      {$group: {_id: "$topic", count: {$sum: 1}}},
      {$sort: {count: -1}},
      {$limit: 10}
    ]);
    console.log("\n🏷️  Top Topics:");
    topTopics.forEach(t => console.log(`   ${t._id}: ${t.count}`));

    // Sample questions
    console.log("\n📚 Sample Questions:");
    const samples = await Question.find({isValid: true}).limit(3).lean();
    samples.forEach((q, i) => {
      console.log(`\n   Q${i+1}: ${q.question.substring(0, 60)}...`);
      console.log(`        Type: ${q.questionType}`);
      console.log(`        Topic: ${q.topic}`);
      console.log(`        Options: ${q.options?.length || 0}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkDatabase();

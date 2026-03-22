import mongoose from "mongoose";

const topicProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true, trim: true },
    mastery: { type: Number, default: 0, min: 0, max: 100 },
    attempts: { type: Number, default: 0 },
    prerequisites: [{ type: String, trim: true }], // Auto-populated by AI
    relatedTopics: [{ type: String, trim: true }] // Auto-populated by AI
  },
  { timestamps: true }
);

const TopicProgress = mongoose.model("TopicProgress", topicProgressSchema);
export default TopicProgress;

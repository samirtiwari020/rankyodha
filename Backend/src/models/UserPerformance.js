import mongoose from "mongoose";

const userPerformanceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    totalQuestions: { type: Number, default: 0, min: 0 },
    correctAnswers: { type: Number, default: 0, min: 0 },
    accuracy: { type: Number, default: 0, min: 0, max: 100 }
  },
  { timestamps: true }
);

userPerformanceSchema.index({ userId: 1, topic: 1 }, { unique: true });
userPerformanceSchema.index({ userId: 1, accuracy: 1 });

const UserPerformance = mongoose.model("UserPerformance", userPerformanceSchema);

export default UserPerformance;
import mongoose from "mongoose";

const userPerformanceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    totalAttempts: { type: Number, default: 0, min: 0 },
    correctAnswers: { type: Number, default: 0, min: 0 },
    wrongAnswers: { type: Number, default: 0, min: 0 },
    accuracy: { type: Number, default: 0, min: 0, max: 100 },
    lastAttemptedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

userPerformanceSchema.index({ userId: 1, subject: 1, topic: 1 }, { unique: true });
userPerformanceSchema.index({ userId: 1, subject: 1, accuracy: 1 });

const UserPerformance = mongoose.model("UserPerformance", userPerformanceSchema);

export default UserPerformance;
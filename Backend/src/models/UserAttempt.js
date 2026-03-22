import mongoose from "mongoose";

const userAttemptSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, required: true, trim: true },
    selectedAnswer: { type: String, default: "" },
    isCorrect: { type: Boolean, required: true },
    attemptedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

userAttemptSchema.index({ userId: 1, subject: 1, attemptedAt: -1 });
userAttemptSchema.index({ userId: 1, questionId: 1 });
userAttemptSchema.index({ userId: 1, subject: 1, topic: 1, attemptedAt: -1 });

const UserAttempt = mongoose.model("UserAttempt", userAttemptSchema);

export default UserAttempt;

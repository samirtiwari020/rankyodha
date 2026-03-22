import mongoose from "mongoose";

const practiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, default: "Medium" },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswerIndex: { type: Number, default: 0 },
    selectedAnswerIndex: { type: Number, default: null },
    isCorrect: { type: Boolean, default: null }
  },
  { timestamps: true }
);

const Practice = mongoose.model("Practice", practiceSchema);
export default Practice;

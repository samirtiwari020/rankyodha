import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    questionNumber: { type: Number, min: 1 },
    subject: {
      type: String,
      required: true,
      enum: ["Physics", "Chemistry", "Math"]
    },
    topic: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"]
    },
    questionType: {
      type: String,
      enum: ["MCQ", "Numerical", "ShortAnswer"],
      default: "MCQ"
    },
    // MCQ fields
    options: { type: [String], default: [] },
    correctAnswer: { type: String, enum: ["A", "B", "C", "D"], default: null },
    // Numerical/ShortAnswer fields
    answer: { type: String, default: null },
    isValid: { type: Boolean, default: true },
    questionHash: { type: String, trim: true, default: null },
    sourceFile: { type: String, trim: true, default: null }
  },
  { timestamps: true }
);

questionSchema.index({ topic: 1, difficulty: 1 });
questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ isValid: 1 });
questionSchema.index({ sourceFile: 1, questionNumber: 1 }, { unique: true, sparse: true });
questionSchema.index({ sourceFile: 1, questionHash: 1 }, { unique: true, sparse: true });

const Question = mongoose.model("Question", questionSchema);

export default Question;
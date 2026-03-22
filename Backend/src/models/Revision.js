import mongoose from "mongoose";

const revisionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    lastReviewedAt: { type: Date, default: null },
    nextRevisionAt: { type: Date, required: true },
    confidence: { type: Number, default: 0, min: 0, max: 5 },
    interval: { type: Number, default: 0 }, // Interval in days
    easeFactor: { type: Number, default: 2.5, min: 1.3 }, // SM-2 Ease Factor
    repetitions: { type: Number, default: 0 } // Consecutive successful recalls
  },
  { timestamps: true }
);

const Revision = mongoose.model("Revision", revisionSchema);
export default Revision;

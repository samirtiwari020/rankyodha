import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    earnedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

achievementSchema.index({ user: 1, code: 1 }, { unique: true });

const Achievement = mongoose.model("Achievement", achievementSchema);
export default Achievement;

import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    examDate: { type: Date },
    topics: [{
      name: { type: String, required: true },
      hoursPerWeek: { type: Number, default: 2 }
    }],
    strategy: { type: String, default: "" }
  },
  { timestamps: true }
);

const StudyPlan = mongoose.model("StudyPlan", studyPlanSchema);
export default StudyPlan;

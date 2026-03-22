import StudyPlan from "../models/StudyPlan.js";

export const generateStudyPlan = async ({ userId, title, examDate, topics = [] }) => {
  const strategy = `Focus on weak topics first, daily 2-3 hour deep work sessions, and weekly revision.`;
  return StudyPlan.create({
    user: userId,
    title,
    examDate,
    topics,
    strategy
  });
};

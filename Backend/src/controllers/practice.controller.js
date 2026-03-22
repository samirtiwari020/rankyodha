import Practice from "../models/Practice.js";
import TopicProgress from "../models/TopicProgress.js";
import { askAI } from "../services/ai.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const generatePractice = asyncHandler(async (req, res) => {
  const { topic, difficulty = "Medium" } = req.body;
  if (!topic) {
    res.status(400);
    throw new Error("Topic is required");
  }

  const prompt = `Generate one MCQ in JSON with fields question, options(4), correctAnswerIndex for topic ${topic} at ${difficulty} level.`;
  const aiText = await askAI(
    prompt,
    JSON.stringify({
      question: `What is a key concept of ${topic}?`,
      options: ["Concept A", "Concept B", "Concept C", "Concept D"],
      correctAnswerIndex: 0
    })
  );

  let payload;
  try {
    payload = JSON.parse(aiText.replace(/```json|```/g, "").trim());
  } catch {
    payload = {
      question: `What is a key concept of ${topic}?`,
      options: ["Concept A", "Concept B", "Concept C", "Concept D"],
      correctAnswerIndex: 0
    };
  }

  const practice = await Practice.create({
    user: req.user._id,
    topic,
    difficulty,
    question: payload.question,
    options: payload.options,
    correctAnswerIndex: payload.correctAnswerIndex
  });

  res.status(201).json(practice);
});

export const submitPractice = asyncHandler(async (req, res) => {
  const { practiceId, selectedAnswerIndex } = req.body;

  const practice = await Practice.findOne({ _id: practiceId, user: req.user._id });

  if (!practice) {
    res.status(404);
    throw new Error("Practice question not found");
  }

  practice.selectedAnswerIndex = selectedAnswerIndex;
  practice.isCorrect = Number(selectedAnswerIndex) === Number(practice.correctAnswerIndex);
  await practice.save();

  await TopicProgress.findOneAndUpdate(
    { user: req.user._id, topic: practice.topic },
    {
      $inc: {
        attempts: 1,
        mastery: practice.isCorrect ? 5 : -2
      }
    },
    { upsert: true, new: true }
  );

  res.json({ isCorrect: practice.isCorrect, correctAnswerIndex: practice.correctAnswerIndex });
});

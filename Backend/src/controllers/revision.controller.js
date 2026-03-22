import { calculateNextReview } from "../utils/spacedRepetition.js";
import TopicProgress from "../models/TopicProgress.js";
import Revision from "../models/Revision.js";
import { askAI } from "../services/ai.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const addRevision = asyncHandler(async (req, res) => {
  const { topic, confidence = 0 } = req.body;
  if (!topic) {
    res.status(400);
    throw new Error("Topic is required");
  }

  // Find existing revision to get previous SM-2 metrics
  let revision = await Revision.findOne({ user: req.user._id, topic });

  let interval = 0;
  let repetitions = 0;
  let easeFactor = 2.5;

  if (revision) {
    interval = revision.interval;
    repetitions = revision.repetitions;
    easeFactor = revision.easeFactor;
  }

  // Calculate new SM-2 metrics
  const sm2 = calculateNextReview(confidence, interval, repetitions, easeFactor);
  
  // Calculate next revision date
  const nextRevisionAt = new Date();
  nextRevisionAt.setDate(nextRevisionAt.getDate() + sm2.interval);

  // Update or create Revision record
  revision = await Revision.findOneAndUpdate(
    { user: req.user._id, topic },
    {
      confidence,
      lastReviewedAt: Date.now(),
      nextRevisionAt,
      interval: sm2.interval,
      repetitions: sm2.repetitions,
      easeFactor: sm2.easeFactor
    },
    { upsert: true, new: true }
  );

  // Auto-update TopicProgress mastery based on SM-2 metrics
  const masteryBoost = confidence >= 3 ? sm2.repetitions * 15 : 0;
  const calculatedMastery = Math.min(100, Math.max(0, masteryBoost));

  let topicProgress = await TopicProgress.findOne({ user: req.user._id, topic });

  if (!topicProgress) {
    // Dynamically generate knowledge graph connections via Gemini for new topics
    let prerequisites = [];
    let relatedTopics = [];

    try {
      const prompt = `Analyze the topic "${topic}". Return a raw JSON object (NO markdown formatting, NO backticks) with two string arrays: "prerequisites" (up to 3 foundational concepts needed before learning this) and "relatedTopics" (up to 3 connected concepts). Example format: {"prerequisites":["Algebra","Functions"],"relatedTopics":["Derivatives","Limits"]}`;
      const aiResponse = await askAI(prompt, '{"prerequisites":[],"relatedTopics":[]}');
      
      // Clean up potential markdown formatting from the response
      const cleanJsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(cleanJsonStr);
      prerequisites = parsed.prerequisites || [];
      relatedTopics = parsed.relatedTopics || [];
    } catch (error) {
      console.error("Failed to generate knowledge graph edges:", error);
    }

    topicProgress = await TopicProgress.create({
      user: req.user._id,
      topic,
      mastery: calculatedMastery,
      attempts: 1,
      prerequisites,
      relatedTopics
    });
  } else {
    topicProgress.mastery = calculatedMastery;
    topicProgress.attempts += 1;
    await topicProgress.save();
  }

  res.status(200).json(revision);
});

export const getRevisions = asyncHandler(async (req, res) => {
  const list = await Revision.find({ user: req.user._id }).sort({ nextRevisionAt: 1 });
  res.json(list);
});

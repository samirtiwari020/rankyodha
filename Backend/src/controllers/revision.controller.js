import { calculateNextReview } from "../utils/spacedRepetition.js";
import TopicProgress from "../models/TopicProgress.js";
import Revision from "../models/Revision.js";
import { askAI } from "../services/ai.service.js";
import { asyncHandler } from "../middleware/error.middleware.js";

export const addRevision = asyncHandler(async (req, res) => {
  const { topic, confidence = 0, course = "jee" } = req.body;
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
      easeFactor: sm2.easeFactor,
      course
    },
    { upsert: true, new: true }
  );

  // Auto-update TopicProgress mastery based on SM-2 metrics
  const masteryBoost = confidence >= 3 ? sm2.repetitions * 15 : 0;
  const calculatedMastery = Math.min(100, Math.max(0, masteryBoost));

  let topicProgress = await TopicProgress.findOne({ user: req.user._id, topic });

  if (!topicProgress) {
    // Simply create/update the topic progress without extra AI-generated ghost nodes
    topicProgress = await TopicProgress.create({
      user: req.user._id,
      topic,
      mastery: calculatedMastery,
      attempts: 1,
      course
    });
  } else {
    topicProgress.mastery = calculatedMastery;
    topicProgress.attempts += 1;
    await topicProgress.save();
  }

  res.status(200).json(revision);
});

export const getRevisions = asyncHandler(async (req, res) => {
  const { course } = req.query;
  const filter = { user: req.user._id };
  if (course) filter.course = course;
  
  const list = await Revision.find(filter).sort({ nextRevisionAt: 1 });
  res.json(list);
});

import Practice from "../models/Practice.js";
import Revision from "../models/Revision.js";
import Notes from "../models/Notes.js";
import TopicProgress from "../models/TopicProgress.js";

export const buildAnalytics = async (userId) => {
  const [practiceCount, correctCount, upcomingRevisions, notesCount] = await Promise.all([
    Practice.countDocuments({ user: userId }),
    Practice.countDocuments({ user: userId, isCorrect: true }),
    Revision.countDocuments({ user: userId, nextRevisionAt: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }),
    Notes.countDocuments({ user: userId })
  ]);

  const accuracy = practiceCount ? Math.round((correctCount / practiceCount) * 100) : 0;

  return {
    practiceCount,
    correctCount,
    accuracy,
    upcomingRevisions,
    notesCount
  };
};

export const buildGraph = async (userId) => {
  const topics = await TopicProgress.find({ user: userId });
  
  const nodes = [];
  const links = [];
  const topicSet = new Set(topics.map(t => t.topic));

  topics.forEach((t) => {
    // Add Node
    nodes.push({
      id: t.topic,
      val: Math.max(1, t.mastery / 10), // Node size representation
      mastery: t.mastery
    });

    // Add Edges (Prerequisites)
    t.prerequisites.forEach((pre) => {
      // Create implicit node if it doesn't exist yet but was suggested by AI
      if (!topicSet.has(pre)) {
        nodes.push({ id: pre, val: 1, mastery: 0 });
        topicSet.add(pre);
      }
      links.push({ source: pre, target: t.topic });
    });

    // Add Edges (Related)
    t.relatedTopics.forEach((rel) => {
      if (!topicSet.has(rel)) {
        nodes.push({ id: rel, val: 1, mastery: 0 });
        topicSet.add(rel);
      }
      // Related topics are bi-directional conceptual links
      links.push({ source: t.topic, target: rel });
    });
  });

  return { nodes, links };
};

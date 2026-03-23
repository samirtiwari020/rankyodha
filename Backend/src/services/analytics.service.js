import Practice from "../models/Practice.js";
import Revision from "../models/Revision.js";
import Notes from "../models/Notes.js";
import TopicProgress from "../models/TopicProgress.js";

export const buildAnalytics = async (userId, course) => {
  const filter = { user: userId };
  if (course) filter.course = course;

  const [practiceCount, correctCount, upcomingRevisions, notesCount] = await Promise.all([
    Practice.countDocuments(filter),
    Practice.countDocuments({ ...filter, isCorrect: true }),
    Revision.countDocuments({ ...filter, nextRevisionAt: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }),
    Notes.countDocuments(filter)
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

export const buildGraph = async (userId, course) => {
  const filter = { user: userId };
  if (course) filter.course = course;
  const topics = await TopicProgress.find(filter);
  
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
      // ONLY link if the prerequisite is an actually studied topic
      if (topicSet.has(pre)) {
        links.push({ source: pre, target: t.topic });
      }
    });

    // Add Edges (Related)
    t.relatedTopics.forEach((rel) => {
      if (topicSet.has(rel)) {
        links.push({ source: t.topic, target: rel });
      }
    });
  });

  return { nodes, links };
};

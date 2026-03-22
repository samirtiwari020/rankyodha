const DEFAULT_TOPICS = ["Core Concepts", "Problem Solving", "Mock Test Review"];

const getDateOffset = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

const toHours = (value, fallback) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
};

export const generateStudyPlan = ({ exam, daysLeft, dailyHours, weakTopics = [] }) => {
  const safeExam = typeof exam === "string" && exam.trim() ? exam.trim() : "JEE";
  const safeDaysLeft = Math.max(0, Math.floor(Number(daysLeft) || 0));
  const safeDailyHours = Math.min(12, toHours(dailyHours, 4));

  const normalizedWeakTopics = Array.isArray(weakTopics)
    ? weakTopics
        .filter((topic) => typeof topic === "string" && topic.trim())
        .map((topic) => topic.trim())
    : [];

  const topicsPool = normalizedWeakTopics.length ? normalizedWeakTopics : DEFAULT_TOPICS;

  const learningHours = Number((safeDailyHours * 0.5).toFixed(1));
  const practiceHours = Number((safeDailyHours * 0.3).toFixed(1));
  const revisionHours = Number(Math.max(0.5, safeDailyHours - learningHours - practiceHours).toFixed(1));

  // Weighted list duplicates weak topics so they appear more frequently.
  const weightedTopics = topicsPool.flatMap((topic) => [topic, topic, `${topic} - application`]);

  const days = Array.from({ length: 5 }).map((_, index) => {
    const date = getDateOffset(index);
    const topicA = weightedTopics[index % weightedTopics.length];
    const topicB = weightedTopics[(index + 2) % weightedTopics.length];
    const revisionTopic = topicsPool[index % topicsPool.length];

    return {
      day: index + 1,
      date,
      focus: safeDaysLeft <= 30 ? "high-intensity" : "balanced",
      slots: [
        {
          type: "learning",
          topic: topicA,
          durationHours: learningHours,
          note: "Concept learning and examples",
        },
        {
          type: "practice",
          topic: topicB,
          durationHours: practiceHours,
          note: "Timed questions and analysis",
        },
        {
          type: "revision",
          topic: revisionTopic,
          durationHours: revisionHours,
          note: "Active recall + short recap",
        },
      ],
      totalHours: safeDailyHours,
    };
  });

  return {
    exam: safeExam,
    daysLeft: safeDaysLeft,
    dailyHours: safeDailyHours,
    summary: {
      planDays: 5,
      strategy: "Weak-topic-first adaptive structure with daily revision",
      split: {
        learningHours,
        practiceHours,
        revisionHours,
      },
    },
    days,
  };
};

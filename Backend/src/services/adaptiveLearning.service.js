import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { askAI } from "./ai.service.js";
import Question from "../models/Question.js";
import UserPerformance from "../models/UserPerformance.js";
import { extractQuestionsFromPdf } from "./questionExtraction.service.js";

const SUBJECTS = ["Physics", "Chemistry", "Math"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const IMPORT_BATCH_SIZE = 20;
const IMPORT_CONCURRENCY = 4;
const importJobs = new Map();

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
};

const normalizeDifficulty = (difficulty) => {
  if (!difficulty) return "Medium";
  const normalized = String(difficulty).trim().toLowerCase();
  if (normalized === "easy") return "Easy";
  if (normalized === "hard") return "Hard";
  return "Medium";
};

const normalizeSubject = (subject) => {
  const normalized = String(subject || "").trim().toLowerCase();
  if (normalized.includes("physics")) return "Physics";
  if (normalized.includes("chem")) return "Chemistry";
  if (normalized.includes("math")) return "Math";
  return "Math";
};

const normalizeCorrectAnswer = (answer) => {
  if (!answer) return null;
  const normalized = String(answer).trim().toUpperCase();
  return ["A", "B", "C", "D"].includes(normalized) ? normalized : null;
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const questionHash = (text) =>
  crypto
    .createHash("sha1")
    .update(String(text || "").replace(/\s+/g, " ").trim().toLowerCase())
    .digest("hex");

const runWithConcurrency = async (items, concurrency, worker) => {
  const output = [];
  let currentIndex = 0;

  const runners = Array.from({ length: Math.min(concurrency, items.length || 1) }, async () => {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      output[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return output;
};

const updateJob = (jobId, patch) => {
  const current = importJobs.get(jobId);
  if (!current) return;
  const next = typeof patch === "function" ? patch(current) : { ...current, ...patch };
  importJobs.set(jobId, next);
};

const createImportJob = () => {
  const jobId = crypto.randomUUID();
  const now = new Date().toISOString();
  const job = {
    jobId,
    status: "queued",
    createdAt: now,
    startedAt: null,
    completedAt: null,
    error: null,
    stats: {
      totalFiles: 0,
      extractedCount: 0,
      processedCount: 0,
      storedCount: 0,
      skippedCount: 0,
      filteredCount: 0
    },
    importedFiles: []
  };
  importJobs.set(jobId, job);
  return job;
};

const buildQuestionDoc = (sourceQuestion, tags) => {
  const sourceFile = sourceQuestion.sourceFile || "unknown";
  const doc = {
    question: sourceQuestion.question,
    questionNumber: sourceQuestion.questionNumber || undefined,
    questionType: sourceQuestion.questionType || "MCQ",
    options: sourceQuestion.options || [],
    subject: tags.subject,
    topic: tags.topic,
    difficulty: tags.difficulty,
    correctAnswer: sourceQuestion.questionType === "MCQ" ? normalizeCorrectAnswer(sourceQuestion.correctAnswer) : null,
    answer: sourceQuestion.questionType !== "MCQ" ? sourceQuestion.answer : null,
    sourceFile,
    questionHash: questionHash(sourceQuestion.question),
    isValid: sourceQuestion.isValid !== false
  };

  return doc;
};

const upsertQuestionDocs = async (docs) => {
  if (docs.length === 0) {
    return { storedCount: 0, skippedCount: 0 };
  }

  const operations = docs.map((doc) => {
    const filter = doc.questionNumber
      ? { sourceFile: doc.sourceFile, questionNumber: doc.questionNumber }
      : { sourceFile: doc.sourceFile, questionHash: doc.questionHash };

    return {
      updateOne: {
        filter,
        update: { $setOnInsert: doc },
        upsert: true
      }
    };
  });

  const result = await Question.bulkWrite(operations, { ordered: false });
  const storedCount = result.upsertedCount || 0;
  const skippedCount = docs.length - storedCount;

  return { storedCount, skippedCount };
};

const detectDifficultyFromContent = (questionText) => {
  const text = String(questionText || "").toLowerCase();
  
  // Hard indicators: advanced mathematical concepts
  const hardKeywords = [
    "differential", "integral", "laplace", "fourier", "matrix", "eigenvalue", "complex",
    "quantum", "relativity", "thermodynamic", "entropy", "equilibrium", "equilibria",
    "optimization", "series", "convergence", "topology", "manifold"
  ];
  
  // Easy indicators: basic concepts
  const easyKeywords = [
    "basic", "simple", "elementary", "introductory", "fundamental", "percentage",
    "ratio", "proportion", "average", "force", "velocity", "distance"
  ];
  
  // Count complexity indicators
  const easyScore = easyKeywords.filter(k => text.includes(k)).length;
  const hardScore = hardKeywords.filter(k => text.includes(k)).length;
  
  // Check for mathematical complexity
  const hasComplexSymbols = /∑|∫|√|∂|∇|Δ|π|∞|≈|±|°/.test(questionText);
  const equationCount = (questionText.match(/[=+\-*/^]/g) || []).length;
  const variableCount = (questionText.match(/[a-z]/g) || []).length;
  
  // Decision logic
  if (hardScore > easyScore) return "Hard";
  if (easyScore > 2) return "Easy";
  if (hasComplexSymbols && variableCount > 5) return "Hard";
  if (equationCount > 10 || variableCount > 10) return "Hard";
  if (equationCount < 3 && variableCount < 3) return "Easy";
  
  return "Medium";
};

const detectTopicFromContent = (questionText) => {
  const text = String(questionText || "").toLowerCase();
  
  // Math topics
  if (/algebra|polynomial|equation|linear|quadratic|root/.test(text)) return "Algebra";
  if (/geometric|geometry|triangle|circle|angle|polygon/.test(text)) return "Geometry";
  if (/calculus|derivative|integral|limit|continuity/.test(text)) return "Calculus";
  if (/trigonometry|sine|cosine|tangent|angle/.test(text)) return "Trigonometry";
  if (/probability|permutation|combination|statistics|binomial/.test(text)) return "Probability";
  if (/complex|imaginary|real/.test(text)) return "Complex Numbers";
  
  // Physics topics
  if (/mechanics|force|motion|velocity|acceleration|newton/.test(text)) return "Mechanics";
  if (/thermodynamic|heat|temperature|entropy|work|energy/.test(text)) return "Thermodynamics";
  if (/electromagnetic|electric|magnetic|field|charge|current/.test(text)) return "Electromagnetism";
  if (/optic|light|wave|reflection|refraction|lens/.test(text)) return "Optics";
  if (/quantum|photon|atomic|nuclear|electron/.test(text)) return "Modern Physics";
  
  // Chemistry topics
  if (/organic|hydrocarbon|carbon|compound|reaction/.test(text)) return "Organic Chemistry";  
  if (/inorganic|metal|salt|acid|base|ion/.test(text)) return "Inorganic Chemistry";
  if (/kinetic|thermodynamic|entropy|state|gas/.test(text)) return "Physical Chemistry";
  if (/biochemistry|protein|enzyme|carbohydrate/.test(text)) return "Biochemistry";
  
  // Default
  return "General Knowledge";
};

export const tagQuestionWithAI = async (questionText, options = [], questionType = "MCQ") => {
  const fullText = options && options.length > 0 
    ? `${questionText}\nOptions:\n${options.map((opt, i) => `${['A','B','C','D'][i] || i+1}: ${opt}`).join('\n')}`
    : questionText;

  // Enhanced prompt with complexity analysis for better difficulty distribution
  const prompt = `You are an expert academic classifier for competitive exams like JEE Main.

Analyze this ${questionType} question and return ONLY valid JSON:
{
  "subject": "Physics|Chemistry|Math",
  "topic": "specific topic name (NOT 'General')",
  "difficulty": "Easy|Medium|Hard"
}

Rules for DIFFICULTY assignment:
- Easy: Single concept application, straightforward calculation, basic formula usage
- Medium: Multiple concepts, requires reasoning, moderate calculation complexity, competitive exam standard
- Hard: Advanced concepts, complex multi-step solution, requires insight and optimization, olympiad-level
- Look for complexity indicators like: nested equations, multiple variables, advanced concepts, competitive-level terminology

Rules for SUBJECT & TOPIC:
- For Physics: "Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Modern Physics", "Waves", "Fluids"
- For Chemistry: "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Biochemistry", "Stoichiometry"
- For Math: "Algebra", "Geometry", "Calculus", "Trigonometry", "Probability", "Statistics", "Complex Numbers"
- Carefully analyze keywords and formulas to determine subject
- Choose specific, meaningful topic names - NEVER use "General"
- Look for repeated concepts to pick the best matching topic

Question (first 400 chars):
${fullText.substring(0, 400)}`;

  const fallback = JSON.stringify({
    subject: "Math",
    topic: "Algebra",
    difficulty: "Medium"
  });

  try {
    const aiText = await askAI(prompt, null);
    
    // If AI returned nothing or fallback was used, use content-based detection
    if (!aiText || aiText === fallback) {
      const detectedDifficulty = detectDifficultyFromContent(questionText);
      const detectedTopic = detectTopicFromContent(questionText);
      
      return {
        subject: "Math",
        topic: detectedTopic,
        difficulty: detectedDifficulty
      };
    }
    
    const parsed = safeJsonParse(aiText);
    
    // Ensure topic is never "General"
    if (!parsed?.topic || parsed.topic.toLowerCase() === "general") {
      parsed.topic = "General Knowledge";
    }

    return {
      subject: normalizeSubject(parsed?.subject),
      topic: String(parsed?.topic || "General Knowledge").trim(),
      difficulty: normalizeDifficulty(parsed?.difficulty)
    };
  } catch (error) {
    console.error("AI tagging error:", error);
    
    // Fallback to content-based detection
    return {
      subject: "Math",
      topic: detectTopicFromContent(questionText),
      difficulty: detectDifficultyFromContent(questionText)
    };
  }
};

export const saveTaggedQuestions = async (questions) => {
  const structuredQuestions = [];

  for (const questionItem of questions) {
    const sourceQuestion =
      typeof questionItem === "string"
        ? { question: questionItem, questionNumber: null, correctAnswer: null, sourceFile: null, questionType: "MCQ", options: [] }
        : questionItem;

    const tags = await tagQuestionWithAI(sourceQuestion.question, sourceQuestion.options, sourceQuestion.questionType);
    structuredQuestions.push({
      question: sourceQuestion.question,
      questionNumber: sourceQuestion.questionNumber || undefined,
      questionType: sourceQuestion.questionType || "MCQ",
      options: sourceQuestion.options || [],
      subject: tags.subject,
      topic: tags.topic,
      difficulty: tags.difficulty,
      correctAnswer: sourceQuestion.questionType === "MCQ" ? normalizeCorrectAnswer(sourceQuestion.correctAnswer) : null,
      answer: sourceQuestion.questionType !== "MCQ" ? sourceQuestion.answer : null,
      sourceFile: sourceQuestion.sourceFile || null,
      questionHash: questionHash(sourceQuestion.question),
      isValid: sourceQuestion.isValid !== false
    });
  }

  if (structuredQuestions.length === 0) {
    return [];
  }

  return Question.insertMany(structuredQuestions, { ordered: false });
};

export const importQuestionsFromDocumentFolder = async (folderPath) => {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const pdfFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"));

  if (pdfFiles.length === 0) {
    return { importedFiles: [], extractedCount: 0, storedCount: 0, skippedCount: 0, filteredCount: 0 };
  }

  const combinedQuestions = [];
  const importedFiles = [];

  for (const file of pdfFiles) {
    const filePath = path.join(folderPath, file.name);
    const buffer = await fs.readFile(filePath);
    const { questions } = await extractQuestionsFromPdf(buffer, file.name);
    combinedQuestions.push(...questions);
    importedFiles.push(file.name);
  }

  let storedCount = 0;
  let skippedCount = 0;
  let filteredCount = 0;

  for (let index = 0; index < combinedQuestions.length; index += IMPORT_BATCH_SIZE) {
    const batch = combinedQuestions.slice(index, index + IMPORT_BATCH_SIZE);

    const taggedDocs = await runWithConcurrency(batch, IMPORT_CONCURRENCY, async (question) => {
      // Skip invalid questions
      if (!question.isValid) {
        filteredCount++;
        return null;
      }
      
      const tags = await tagQuestionWithAI(question.question, question.options, question.questionType);
      return buildQuestionDoc(question, tags);
    });

    // Filter out null entries (invalid questions)
    const validDocs = taggedDocs.filter((doc) => doc !== null);
    
    const result = await upsertQuestionDocs(validDocs);
    storedCount += result.storedCount;
    skippedCount += result.skippedCount;
  }

  return {
    importedFiles,
    extractedCount: combinedQuestions.length,
    storedCount,
    skippedCount,
    filteredCount
  };
};

export const startImportQuestionsFromDocumentFolderJob = (folderPath) => {
  const job = createImportJob();

  Promise.resolve()
    .then(async () => {
      updateJob(job.jobId, (current) => ({
        ...current,
        status: "running",
        startedAt: new Date().toISOString()
      }));

      const entries = await fs.readdir(folderPath, { withFileTypes: true });
      const pdfFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"));

      if (pdfFiles.length === 0) {
        throw new Error("No PDF files found in Backend/document");
      }

      updateJob(job.jobId, (current) => ({
        ...current,
        importedFiles: pdfFiles.map((file) => file.name),
        stats: {
          ...current.stats,
          totalFiles: pdfFiles.length
        }
      }));

      const combinedQuestions = [];

      for (const file of pdfFiles) {
        const filePath = path.join(folderPath, file.name);
        const buffer = await fs.readFile(filePath);
        const { questions } = await extractQuestionsFromPdf(buffer, file.name);
        combinedQuestions.push(...questions);
      }

      updateJob(job.jobId, (current) => ({
        ...current,
        stats: {
          ...current.stats,
          extractedCount: combinedQuestions.length
        }
      }));

      for (let index = 0; index < combinedQuestions.length; index += IMPORT_BATCH_SIZE) {
        const batch = combinedQuestions.slice(index, index + IMPORT_BATCH_SIZE);

        const taggedDocs = await runWithConcurrency(batch, IMPORT_CONCURRENCY, async (question) => {
          // Skip invalid questions (junk filtered out here)
          if (!question.isValid) {
            return null;
          }
          
          const tags = await tagQuestionWithAI(question.question, question.options, question.questionType);
          return buildQuestionDoc(question, tags);
        });

        // Filter out null entries (invalid questions)
        const validDocs = taggedDocs.filter((doc) => doc !== null);
        
        const { storedCount, skippedCount } = await upsertQuestionDocs(validDocs);
        const filteredInBatch = batch.length - validDocs.length;

        updateJob(job.jobId, (current) => ({
          ...current,
          stats: {
            ...current.stats,
            processedCount: current.stats.processedCount + batch.length,
            storedCount: current.stats.storedCount + storedCount,
            skippedCount: current.stats.skippedCount + skippedCount,
            filteredCount: current.stats.filteredCount + filteredInBatch
          }
        }));
      }

      updateJob(job.jobId, (current) => ({
        ...current,
        status: "completed",
        completedAt: new Date().toISOString()
      }));
    })
    .catch((error) => {
      updateJob(job.jobId, (current) => ({
        ...current,
        status: "failed",
        error: error.message || "Import failed",
        completedAt: new Date().toISOString()
      }));
    });

  return job;
};

export const getImportJobStatus = (jobId) => importJobs.get(jobId) || null;

export const fetchPracticeQuestions = async ({ topicOrSubject, difficulty, limit = 5, includeAnswers = false }) => {
  const baseQuery = { isValid: true }; // Always filter to valid questions

  if (topicOrSubject) {
    const normalized = String(topicOrSubject).trim();
    const pattern = new RegExp(`^${escapeRegex(normalized)}$`, "i");
    baseQuery.$or = [{ topic: pattern }, { subject: pattern }];
  }

  const withDifficultyQuery = { ...baseQuery };
  const normalizedDifficulty = difficulty ? String(difficulty).trim() : "";
  if (normalizedDifficulty) {
    withDifficultyQuery.difficulty = new RegExp(`^${escapeRegex(normalizedDifficulty)}$`, "i");
  }

  const buildQuery = (query) => {
    const queryBuilder = Question.find(query).limit(limit);
    if (!includeAnswers) {
      queryBuilder.select("-correctAnswer -answer");
    }
    return queryBuilder;
  };

  let questions = await buildQuery(withDifficultyQuery).lean();

  if (questions.length === 0 && normalizedDifficulty) {
    questions = await buildQuery(baseQuery).lean();
  }

  if (questions.length === 0 && topicOrSubject) {
    const normalized = String(topicOrSubject).trim();
    const subjectOnly = { isValid: true, subject: new RegExp(`^${escapeRegex(normalized)}$`, "i") };
    questions = await buildQuery(subjectOnly).lean();
  }

  if (questions.length === 0) {
    const globalFallback = { isValid: true };
    if (normalizedDifficulty) {
      globalFallback.difficulty = new RegExp(`^${escapeRegex(normalizedDifficulty)}$`, "i");
    }
    questions = await buildQuery(globalFallback).lean();
  }

  if (questions.length === 0 && normalizedDifficulty) {
    questions = await buildQuery({ isValid: true }).lean();
  }

  return questions;
};

export const getQuestionCatalogSummary = async () => {
  const [totalQuestions, totalValid, bySubjectRaw, byDifficultyRaw, byTypeRaw, topTopicsRaw] = await Promise.all([
    Question.countDocuments(),
    Question.countDocuments({ isValid: true }),
    Question.aggregate([
      { $match: { isValid: true } },
      { $group: { _id: { $ifNull: ["$subject", "Unknown"] }, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]),
    Question.aggregate([
      { $match: { isValid: true } },
      { $group: { _id: { $ifNull: ["$difficulty", "Unknown"] }, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]),
    Question.aggregate([
      { $match: { isValid: true } },
      { $group: { _id: { $ifNull: ["$questionType", "MCQ"] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Question.aggregate([
      { $match: { isValid: true } },
      { $group: { _id: { $ifNull: ["$topic", "Unknown"] }, count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 20 }
    ])
  ]);

  const bySubject = bySubjectRaw.map((item) => ({ subject: item._id, count: item.count }));
  const byDifficulty = byDifficultyRaw.map((item) => ({ difficulty: item._id, count: item.count }));
  const byType = byTypeRaw.map((item) => ({ type: item._id, count: item.count }));
  const topTopics = topTopicsRaw.map((item) => ({ topic: item._id, count: item.count }));

  return {
    totalQuestions,
    totalValid,
    bySubject,
    byDifficulty,
    byType,
    topTopics
  };
};

export const updateUserPerformance = async ({ userId, submissions }) => {
  const questionIds = submissions.map((item) => item.questionId);
  const questions = await Question.find({ _id: { $in: questionIds } }).lean();
  const questionMap = new Map(questions.map((question) => [String(question._id), question]));

  const evaluatedSubmissions = submissions
    .map((submission) => {
      const question = questionMap.get(String(submission.questionId));
      if (!question) return null;

      let isCorrect = false;
      
      // Handle both MCQ and Numerical/ShortAnswer
      if (question.questionType === "MCQ") {
        isCorrect = String(submission.selectedAnswer).toUpperCase() === question.correctAnswer;
      } else {
        // For numerical answers, do case-insensitive comparison
        isCorrect = String(submission.selectedAnswer).toLowerCase().trim() === 
                   String(question.answer || "").toLowerCase().trim();
      }

      return {
        questionId: String(submission.questionId),
        topic: question.topic,
        selectedAnswer: submission.selectedAnswer,
        correctAnswer: question.questionType === "MCQ" ? question.correctAnswer : question.answer,
        isCorrect,
        questionType: question.questionType
      };
    })
    .filter(Boolean);

  const topicStats = new Map();

  evaluatedSubmissions.forEach((submission) => {
    const existing = topicStats.get(submission.topic) || { total: 0, correct: 0 };
    existing.total += 1;
    existing.correct += submission.isCorrect ? 1 : 0;
    topicStats.set(submission.topic, existing);
  });

  const updates = [];

  for (const [topic, stat] of topicStats.entries()) {
    const current = await UserPerformance.findOne({ userId, topic });
    const totalQuestions = (current?.totalQuestions || 0) + stat.total;
    const correctAnswers = (current?.correctAnswers || 0) + stat.correct;
    const accuracy = totalQuestions > 0 ? Number(((correctAnswers / totalQuestions) * 100).toFixed(2)) : 0;

    const updated = await UserPerformance.findOneAndUpdate(
      { userId, topic },
      { totalQuestions, correctAnswers, accuracy },
      { upsert: true, new: true }
    ).lean();

    updates.push(updated);
  }

  const score = evaluatedSubmissions.reduce((acc, item) => acc + (item.isCorrect ? 1 : 0), 0);

  return {
    score,
    totalAttempted: evaluatedSubmissions.length,
    evaluatedSubmissions,
    updatedPerformance: updates
  };
};

export const analyzeUserPerformance = async (userId) => {
  const performance = await UserPerformance.find({ userId }).sort({ accuracy: 1 }).lean();
  const weakTopics = performance.filter((item) => item.accuracy < 50).map((item) => item.topic);

  return { performance, weakTopics };
};

export const getRecommendedDifficulty = (accuracy) => {
  if (accuracy < 50) return "Easy";
  if (accuracy <= 75) return "Medium";
  return "Hard";
};

export const getAdaptiveRecommendation = async ({ userId, topic }) => {
  const existing = await UserPerformance.findOne({ userId, topic }).lean();
  const recommendedDifficulty = getRecommendedDifficulty(existing?.accuracy ?? 0);

  const questions = await fetchPracticeQuestions({
    topicOrSubject: topic,
    difficulty: recommendedDifficulty,
    limit: 5,
    includeAnswers: false
  });

  return {
    topic,
    accuracy: existing?.accuracy ?? 0,
    recommendedDifficulty,
    questions
  };
};

export { SUBJECTS, DIFFICULTIES };

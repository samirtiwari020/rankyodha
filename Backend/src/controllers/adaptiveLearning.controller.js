import mongoose from "mongoose";
import path from "path";
import { asyncHandler } from "../middleware/error.middleware.js";
import { extractQuestionsFromPdf } from "../services/questionExtraction.service.js";
import {
  saveTaggedQuestions,
  fetchPracticeQuestions,
  updateUserPerformance,
  analyzeUserPerformance,
  getAdaptiveRecommendation,
  getAdaptiveNextQuestion,
  startImportQuestionsFromDocumentFolderJob,
  getImportJobStatus,
  getQuestionCatalogSummary
} from "../services/adaptiveLearning.service.js";

export const uploadAndTagQuestions = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    res.status(400);
    throw new Error("PDF file is required");
  }

  const { questions: rawQuestions } = await extractQuestionsFromPdf(req.file.buffer, req.file.originalname);

  if (rawQuestions.length === 0) {
    res.status(400);
    throw new Error("No questions extracted from PDF");
  }

  const savedQuestions = await saveTaggedQuestions(rawQuestions);

  res.status(201).json({
    extractedCount: rawQuestions.length,
    storedCount: savedQuestions.length,
    questions: savedQuestions
  });
});

export const importQuestionsFromLocalDocumentFolder = asyncHandler(async (req, res) => {
  const folderPath = path.resolve(process.cwd(), "document");
  const job = startImportQuestionsFromDocumentFolderJob(folderPath);

  res.status(202).json({
    message: "Import started",
    jobId: job.jobId,
    status: job.status
  });
});

export const getImportStatus = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const job = getImportJobStatus(jobId);

  if (!job) {
    res.status(404);
    throw new Error("Import job not found");
  }

  res.json(job);
});

export const getPracticeQuestions = asyncHandler(async (req, res) => {
  const { topic, subject, difficulty } = req.query;

  const normalizedTopic = topic ? String(topic).trim() : "";
  const normalizedSubject = subject ? String(subject).trim() : "";
  const topicOrSubject = normalizedTopic || normalizedSubject;

  if (!topicOrSubject) {
    res.status(400);
    throw new Error("topic or subject is required");
  }

  const questions = await fetchPracticeQuestions({
    topicOrSubject,
    difficulty: difficulty ? String(difficulty) : undefined,
    limit: 5
  });

  // Enrich questions with generated options if needed
  const { enrichMultipleQuestions } = await import("../services/questionEnrichment.service.js");
  const enrichedQuestions = await enrichMultipleQuestions(questions);

  res.json({ count: enrichedQuestions.length, questions: enrichedQuestions });
});

export const getQuestionCatalog = asyncHandler(async (req, res) => {
  const summary = await getQuestionCatalogSummary();
  res.json(summary);
});

export const submitPracticeAnswers = asyncHandler(async (req, res) => {
  const { submissions } = req.body;

  if (!Array.isArray(submissions) || submissions.length === 0) {
    res.status(400);
    throw new Error("submissions array is required");
  }

  const normalizedSubmissions = submissions.map((item) => {
    if (!item.questionId || typeof item.selectedAnswer === "undefined") {
      throw new Error("Each submission needs questionId and selectedAnswer");
    }

    if (!mongoose.Types.ObjectId.isValid(String(item.questionId))) {
      throw new Error("Invalid questionId in submissions");
    }

    return {
      questionId: String(item.questionId),
      selectedAnswer: item.selectedAnswer
    };
  });

  const result = await updateUserPerformance({
    userId: String(req.user._id),
    submissions: normalizedSubmissions
  });

  res.json(result);
});

export const getPerformanceAnalysis = asyncHandler(async (req, res) => {
  const analysis = await analyzeUserPerformance(String(req.user._id));
  res.json(analysis);
});

export const getAdaptiveQuestions = asyncHandler(async (req, res) => {
  const { topic } = req.query;
  if (!topic) {
    res.status(400);
    throw new Error("topic is required");
  }

  const recommendation = await getAdaptiveRecommendation({
    userId: String(req.user._id),
    topic: String(topic)
  });

  // Enrich questions with generated options if needed
  if (recommendation.questions && recommendation.questions.length > 0) {
    const { enrichMultipleQuestions } = await import("../services/questionEnrichment.service.js");
    recommendation.questions = await enrichMultipleQuestions(recommendation.questions);
  }

  res.json(recommendation);
});

export const getNextAdaptiveQuestion = asyncHandler(async (req, res) => {
  const subject = req.query.subject ? String(req.query.subject).trim() : "";
  if (!subject) {
    res.status(400);
    throw new Error("subject is required");
  }

  const adaptiveResult = await getAdaptiveNextQuestion({
    userId: String(req.user._id),
    subject
  });

  // Enrich question with generated options if needed
  if (adaptiveResult.question) {
    const { enrichQuestionWithGeneratedOptions } = await import("../services/questionEnrichment.service.js");
    adaptiveResult.question = await enrichQuestionWithGeneratedOptions(adaptiveResult.question);
  }

  res.json(adaptiveResult);
});

export const submitAdaptiveAttempt = asyncHandler(async (req, res) => {
  const { questionId, selectedAnswer, isCorrect } = req.body;

  if (!questionId || !mongoose.Types.ObjectId.isValid(String(questionId))) {
    res.status(400);
    throw new Error("Valid questionId is required");
  }

  if (typeof selectedAnswer === "undefined" && typeof isCorrect !== "boolean") {
    res.status(400);
    throw new Error("selectedAnswer or isCorrect is required");
  }

  const result = await updateUserPerformance({
    userId: String(req.user._id),
    submissions: [
      {
        questionId: String(questionId),
        selectedAnswer,
        isCorrect
      }
    ]
  });

  res.json(result);
});
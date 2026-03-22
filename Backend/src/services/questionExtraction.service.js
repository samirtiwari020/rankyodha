import pdfParse from "pdf-parse";

const normalizeQuestionText = (text) =>
  text
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001F]+/g, " ")
    .trim();

// Regex patterns for common question markers
const JUNK_KEYWORDS = [
  "advertisement", "sponsored", "click here", "subscribe", "follow us", "download", "install",
  "contact us", "email us", "call us", "visit", "www.", "http", ".com", ".in", ".org",
  "copyright", "all rights reserved", "terms and conditions", "privacy policy", "disclaimer"
];

const isJunkText = (text) => {
  const lowered = String(text).toLowerCase();
  const endsWithQuestion = text.trim().endsWith("?");
  
  // Must end with question mark or be at least somewhat substantial
  if (!endsWithQuestion && text.length < 30) return true;
  
  // Check for junk keywords
  for (const keyword of JUNK_KEYWORDS) {
    if (lowered.includes(keyword)) return true;
  }
  
  // Check if it looks like metadata (mostly numbers/dates)
  const wordCount = text.split(/\s+/).length;
  const numberCount = (text.match(/\d+/g) || []).length;
  if (numberCount > wordCount * 0.5) return true;
  
  return false;
};

const getQuestionAndAnswerSections = (rawText) => {
  const sanitized = rawText.replace(/\r/g, "\n").replace(/\n{2,}/g, "\n").trim();
  const markerRegex = /(?:answer\s*key|answers\s*[:\-]?|key\s*[:\-]?)/gi;
  let markerMatch;
  let lastMarkerIndex = -1;

  while ((markerMatch = markerRegex.exec(sanitized)) !== null) {
    const context = sanitized.substring(Math.max(0, markerMatch.index - 30), markerMatch.index + 30).toLowerCase();
    if (!context.includes("video solutions") && !context.includes("available inside")) {
      lastMarkerIndex = markerMatch.index;
    }
  }

  if (lastMarkerIndex < Math.floor(sanitized.length * 0.45)) {
    const denseKeyRegex = /1\.\s*\(?[A-D1-4]\)?\s*2\.\s*\(?[A-D1-4]\)?\s*3\.\s*\(?[A-D1-4]\)?/i;
    const searchArea = sanitized.substring(Math.floor(sanitized.length * 0.6));
    const denseMatch = denseKeyRegex.exec(searchArea);
    if (denseMatch) {
      lastMarkerIndex = Math.floor(sanitized.length * 0.6) + denseMatch.index;
    }
  }

  if (lastMarkerIndex > Math.floor(sanitized.length * 0.45)) {
    return {
      questionSection: sanitized.slice(0, lastMarkerIndex).trim(),
      answerSection: sanitized.slice(lastMarkerIndex).trim()
    };
  }

  return { questionSection: sanitized, answerSection: "" };
};

const parseAnswerKey = (answerSection) => {
  if (!answerSection) return new Map();
  const answerMap = new Map();
  const answerRegex = /(\d{1,4})\s*[).:\-]?\s*\(?([A-D1-4])\)?\b/gi;
  let match;

  while ((match = answerRegex.exec(answerSection)) !== null) {
    let answerVal = String(match[2]).toUpperCase();
    if (answerVal === "1") answerVal = "A";
    else if (answerVal === "2") answerVal = "B";
    else if (answerVal === "3") answerVal = "C";
    else if (answerVal === "4") answerVal = "D";
    answerMap.set(Number(match[1]), answerVal);
  }

  return answerMap;
};

// Detect question type and extract options if MCQ
const detectQuestionTypeAndOptions = (questionText) => {
  const text = String(questionText).trim();
  
  // Pattern 1: (A) option or (A) text or A. text or a) text
  const letterOptionRegex = /(?:^|\n|\s)\(?([A-D])\)?[).:\-]\s*([\s\S]*?)(?=(?:\n|\s)*\(?[A-D]\)?[).:\-]|$)/gi;
  
  // Pattern 2: (1) option, (2) option, etc. - common in JEE/competitive exams
  const numberOptionRegex = /(?:^|\n|\s)\(([1-4])\)\s*([\s\S]*?)(?=(?:\n|\s)*\([1-4]\)|$)/g;
  
  // Try letter pattern first
  const letterOptions = [];
  let letterMatch;
  const tempLetterOptions = new Map();
  
  while ((letterMatch = letterOptionRegex.exec(text)) !== null) {
    const letter = letterMatch[1].toUpperCase();
    const optionText = normalizeQuestionText(letterMatch[2]).trim();
    if (optionText.length > 0 && optionText.length < 500) {
      tempLetterOptions.set(letter, optionText);
    }
  }

  // If we found letter options, use them
  if (tempLetterOptions.size >= 2) {
    for (const letter of ['A', 'B', 'C', 'D']) {
      if (tempLetterOptions.has(letter)) {
        letterOptions.push(tempLetterOptions.get(letter));
      }
    }

    if (letterOptions.length >= 2) {
      const stemWithoutOptions = text
        .replace(letterOptionRegex, "")
        .replace(/\s+/g, " ")
        .trim();
      
      return {
        questionType: "MCQ",
        questionStem: stemWithoutOptions || text,
        options: letterOptions.slice(0, 4),
        hasNumericalAnswer: false
      };
    }
  }

  // Try number pattern (1)(2)(3)(4)
  const numberOptions = [];
  let numberMatch;
  const tempNumberOptions = new Map();

  while ((numberMatch = numberOptionRegex.exec(text)) !== null) {
    const num = numberMatch[1];
    const optionText = normalizeQuestionText(numberMatch[2]).trim();
    if (optionText.length > 0 && optionText.length < 500) {
      tempNumberOptions.set(num, optionText);
    }
  }

  // If we found number options and there are 2+, it's MCQ
  if (tempNumberOptions.size >= 2) {
    for (let i = 1; i <= 4; i++) {
      if (tempNumberOptions.has(String(i))) {
        numberOptions.push(tempNumberOptions.get(String(i)));
      }
    }

    if (numberOptions.length >= 2) {
      // Remove options from stem
      const stemWithoutOptions = text
        .replace(numberOptionRegex, "")
        .replace(/\s+/g, " ")
        .trim();
      
      // If we have options, it's MCQ
      return {
        questionType: "MCQ",
        questionStem: stemWithoutOptions || text,
        options: numberOptions.slice(0, 4),
        hasNumericalAnswer: false
      };
    }
  }

  // No structured options found - could be numerical or short answer
  // Check presence of patterns that indicate numerical
  const endsWithNumber = /[\d\)}\]]\s*$/.test(text);
  const hasEquation = /[x=+\-*/^∑∫√]/i.test(text);
  
  if (endsWithNumber || hasEquation) {
    return {
      questionType: "Numerical",
      questionStem: text,
      options: [],
      hasNumericalAnswer: true
    };
  }

  // Default: MCQ but no options extracted yet (might be in PDF as images)
  return {
    questionType: "MCQ",
    questionStem: text,
    options: [],
    hasNumericalAnswer: false
  };
};

const splitQuestions = (questionSection) => {
  const parsedQuestions = [];
  const questionRegex = /(?:^|\n)\s*(?:Q|Question)\.?\s*(\d{1,4})\s*[).:\-]\s+([\s\S]*?)(?=(?:\n\s*(?:Q|Question)\.?\s*\d{1,4}\s*[).:\-]\s+)|$)/gi;
  let match;

  while ((match = questionRegex.exec(questionSection)) !== null) {
    const questionNumber = Number(match[1]);
    const questionText = normalizeQuestionText(match[2]);
    
    if (questionText.length > 20 && !isJunkText(questionText)) {
      parsedQuestions.push({ questionNumber, question: questionText });
    }
  }

  if (parsedQuestions.length > 0) {
    return parsedQuestions;
  }

  // Fallback parsing
  const fallback = questionSection
    .split(/(?=\n?\s*(?:Q\.?\s*\d+|Question\s*\d+|\d+[).]))/gi)
    .map((chunk) => normalizeQuestionText(chunk))
    .filter((chunk) => chunk.length > 20 && !isJunkText(chunk))
    .map((question, index) => ({ questionNumber: index + 1, question }));

  if (fallback.length > 0) {
    return fallback;
  }

  // Last resort: split by question mark
  return questionSection
    .split(/\?(?:\s+|$)/g)
    .map((chunk) => normalizeQuestionText(`${chunk}?`))
    .filter((chunk) => chunk.length > 20 && !isJunkText(chunk))
    .map((question, index) => ({ questionNumber: index + 1, question }));
};

export const extractQuestionsFromPdf = async (fileBuffer, sourceFile = null) => {
  const parsed = await pdfParse(fileBuffer);
  const rawText = (parsed.text || "").trim();

  if (!rawText) {
    return { rawText: "", questions: [] };
  }

  const { questionSection, answerSection } = getQuestionAndAnswerSections(rawText);
  const answerMap = parseAnswerKey(answerSection);
  const questionBlocks = splitQuestions(questionSection);

  const questions = questionBlocks.map((item) => {
    const { questionStem, questionType, options, hasNumericalAnswer } = detectQuestionTypeAndOptions(item.question);
    
    return {
      question: questionStem,
      questionNumber: item.questionNumber,
      questionType,
      options: options.length > 0 ? options : [],
      correctAnswer: (questionType === "MCQ") ? (answerMap.get(item.questionNumber) || null) : null,
      answer: null, // Will be filled by AI tagging for numerical questions
      sourceFile,
      isValid: true
    };
  });

  return { rawText, questions };
};
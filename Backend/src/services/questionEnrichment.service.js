import { askAI } from "./ai.service.js";

const generatePlaceholderOptions = (correctAnswer) => {
  // Diverse pool of realistic options for different subject areas
  const optionPool = [
    "10 m/s", "20 m/s", "30 m/s", "40 m/s", "50 m/s", "60 m/s", "70 m/s",
    "100 J", "200 J", "300 J", "400 J", "500 J", "1000 J", "2000 J",
    "1 kg", "2 kg", "3 kg", "4 kg", "5 kg", "10 kg",
    "45°", "60°", "90°", "120°", "135°", "180°",
    "Yes", "No", "Maybe", "Cannot determine", "All of the above", "None of the above",
    "1.5 V", "3 V", "6 V", "12 V", "24 V",
    "0.5 A", "1 A", "2 A", "5 A", "10 A",
    "500 Hz", "1000 Hz", "5000 Hz", "10000 Hz"
  ];

  const correctIndex = Math.max(0, Math.min(3, String(correctAnswer || "A").charCodeAt(0) - 65));
  const selected = new Set();
  const options = [];

  // Add correct answer at correct position
  options[correctIndex] = optionPool[Math.floor(Math.random() * optionPool.length)];
  selected.add(options[correctIndex]);

  // Fill remaining positions with unique options
  for (let i = 0; i < 4; i++) {
    if (i !== correctIndex) {
      let option;
      do {
        option = optionPool[Math.floor(Math.random() * optionPool.length)];
      } while (selected.has(option));
      options[i] = option;
      selected.add(option);
    }
  }

  return options;
};

export const enrichQuestionWithGeneratedOptions = async (question) => {
  // If question already has options, return as-is
  if (Array.isArray(question.options) && question.options.length >= 2) {
    return question;
  }

  // If not MCQ or no correct answer, return as-is
  if (question.questionType !== "MCQ" || !question.correctAnswer) {
    return question;
  }

  // Try AI generation first
  try {
    const prompt = `Generate 4 realistic multiple choice options for this ${question.subject} question about ${question.topic} (${question.difficulty} level).

Question: ${question.question}

Correct answer is: ${question.correctAnswer}

Return ONLY valid JSON (no markdown, no explanations):
{"options": ["Option A", "Option B", "Option C", "Option D"]}

Make sure the correct answer appears in the options.`;

    const response = await askAI(prompt);
    
    if (response && !response.includes("No AI response") && response.length > 20) {
      try {
        const jsonMatch = response.match(/\\{[\\s\\S]*\\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : response);
        
        if (Array.isArray(parsed.options) && parsed.options.length === 4) {
          return {
            ...question,
            options: parsed.options,
            _optionsGenerated: true,
            _generationMethod: "ai"
          };
        }
      } catch (e) {
        // JSON parse failed, fall through to placeholder
      }
    }
  } catch (error) {
    // AI generation failed, fall through to placeholder
  }

  // Fallback: use placeholder options
  const placeholderOpts = generatePlaceholderOptions(question.correctAnswer);
  return {
    ...question,
    options: placeholderOpts,
    _optionsGenerated: true,
    _generationMethod: "placeholder",
    _note: "Options were generated as placeholders since AI generation was unavailable"
  };
};

export const enrichMultipleQuestions = async (questions) => {
  return Promise.all(questions.map(q => enrichQuestionWithGeneratedOptions(q)));
};

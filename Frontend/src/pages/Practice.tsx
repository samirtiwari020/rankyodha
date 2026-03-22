import { motion, type Variants, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Loader2,
  Lightbulb,
  Trophy,
  AlertCircle,
  Target,
  Zap,
  TrendingUp,
  Brain,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { useCourse } from "@/contexts/CourseContext";
import { getCourseData, getCourseColorScheme } from "@/utils/courseData";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0 } },
};

interface QuestionData {
  id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  hint1: string;
  hint2: string;
  solution: string;
  questionType?: "MCQ" | "Numerical" | "ShortAnswer";
  numericalAnswer?: string;
}

interface PracticeApiQuestion {
  _id?: string;
  id?: string;
  question?: string;
  options?: string[];
  correctAnswerIndex?: number;
  hint1?: string;
  hint2?: string;
  solution?: string;
  questionType?: "MCQ" | "Numerical" | "ShortAnswer";
  answer?: string;
}

interface AdaptivePracticeResponse {
  count: number;
  questions: PracticeApiQuestion[];
}

interface AdaptiveNextQuestionResponse {
  subject: string;
  topic: string | null;
  recommendedDifficulty: "Easy" | "Medium" | "Hard";
  question: PracticeApiQuestion | null;
}

interface AdaptiveSubmitResponse {
  score: number;
  totalAttempted: number;
  evaluatedSubmissions: Array<{
    questionId: string;
    selectedAnswer: string | number;
    correctAnswer: "A" | "B" | "C" | "D" | null;
    isCorrect: boolean;
  }>;
}

interface QuestionResult {
  questionData: QuestionData;
  selectedOption: number | null;
  usedHint: boolean;
  isCorrect: boolean;
  correctAnswerLetter: "A" | "B" | "C" | "D" | null;
  marksEarned: number;
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

const parseQuestionText = (rawQuestion: string, apiOptions?: string[]) => {
  if (Array.isArray(apiOptions) && apiOptions.length >= 2) {
    return {
      questionText: rawQuestion,
      options: apiOptions.slice(0, 4)
    };
  }

  const text = String(rawQuestion || "").replace(/\r/g, "\n").trim();
  const markerRegex = /(?:^|\n|\s)(?:\(?)([A-D])(?:\)|[).:\-])\s*/g;
  const markers: Array<{ letter: string; index: number; markerEnd: number }> = [];
  let markerMatch;

  while ((markerMatch = markerRegex.exec(text)) !== null) {
    markers.push({
      letter: markerMatch[1],
      index: markerMatch.index,
      markerEnd: markerRegex.lastIndex
    });
  }

  if (markers.length >= 2) {
    const firstMarker = markers[0];
    const stem = text.slice(0, firstMarker.index).trim();
    const optionBuckets = new Map<string, string>();

    markers.forEach((marker, i) => {
      const end = i + 1 < markers.length ? markers[i + 1].index : text.length;
      const content = text.slice(marker.markerEnd, end).trim();
      if (content) {
        optionBuckets.set(marker.letter, content);
      }
    });

    const orderedOptions = OPTION_LETTERS.map((letter) => optionBuckets.get(letter) || "").filter(Boolean);

    if (orderedOptions.length >= 2) {
      return {
        questionText: stem || rawQuestion,
        options: orderedOptions.slice(0, 4)
      };
    }
  }

  return {
    questionText: rawQuestion,
    options: Array.isArray(apiOptions) ? apiOptions.slice(0, 4) : []
  };
};

export default function Practice() {
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);
  const courseColors = getCourseColorScheme(selectedCourse);
  
  // Use course-specific subjects or default topics
  const topics = courseData.subjects;
  const difficulties = ["Easy", "Medium", "Hard"];
  
  const [stage, setStage] = useState<"select" | "quiz" | "evaluation">("select");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Quiz State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [numericalAnswer, setNumericalAnswer] = useState<string>("");

  // Scoring & Hints Status
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [results, setResults] = useState<QuestionResult[]>([]);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  };

  const normalizeQuestion = (item: PracticeApiQuestion): QuestionData => {
    const questionType = item.questionType || "MCQ";
    const rawQuestion = item.question || "Question unavailable";
    
    // For MCQ questions, prioritize options from database
    let options: string[] = [];
    let correctAnswerIndex: number = -1;
    
    if (questionType === "MCQ") {
      // Use options from database if available
      if (Array.isArray(item.options) && item.options.length >= 2) {
        options = item.options.slice(0, 4);
        correctAnswerIndex = item.correctAnswerIndex ?? -1;
      } else {
        // Fallback: try to parse from question text
        const { questionText, options: parsedOptions } = parseQuestionText(rawQuestion, item.options);
        options = parsedOptions;
        correctAnswerIndex = item.correctAnswerIndex ?? -1;
      }
    } else if (questionType === "Numerical" || questionType === "ShortAnswer") {
      // For numerical/short answer, just use question text
      options = [];
      correctAnswerIndex = -1;
    }

    return {
      id: item._id || item.id,
      question: rawQuestion,
      options,
      correctAnswerIndex,
      questionType,
      numericalAnswer: item.answer || undefined,
      hint1: item.hint1 || "Use elimination and identify the core concept first.",
      hint2: item.hint2 || "Re-check units/keywords before finalizing.",
      solution: item.solution || "Review the concept summary for this topic to confirm your reasoning."
    };
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === "quiz" && !loading && questions.length > 0) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, loading, questions]);

  const fetchQuestions = async () => {
    setLoading(true);
    setStage("quiz");
    setCurrentQIndex(0);
    setResults([]);
    setErrorMsg("");
    setQuestions([]);
    setSelectedOption(null);
    setNumericalAnswer("");

    try {
      const requestTopic = selectedTopic === "Mathematics" ? "Math" : selectedTopic;
      const data = await apiRequest<AdaptiveNextQuestionResponse>(
        `/api/v1/adaptive-learning/next?subject=${encodeURIComponent(requestTopic)}`,
        { method: "GET" },
        true
      );

      const normalized = data.question ? [normalizeQuestion(data.question)] : [];

      if (normalized.length === 0) {
        throw new Error("No adaptive question found for this subject. Import your question bank first.");
      }

      setQuestions(normalized);
      setSelectedDifficulty(data.recommendedDifficulty || "Medium");

      setTimeElapsed(0);
      setRevealedHints(0);
      setSelectedOption(null);
      setNumericalAnswer("");
    } catch (error: unknown) {
      console.error(error);
      setErrorMsg(getErrorMessage(error, "Failed to load questions."));
      setStage("select");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    if (selectedTopic) {
      fetchQuestions();
    }
  };

  const submitAnswer = () => {
    const currQ = questions[currentQIndex];
    const isMCQ = currQ.questionType === "MCQ";
    const hasAnswer = isMCQ ? selectedOption !== null : numericalAnswer.trim().length > 0;
    
    if (!hasAnswer) return;

    const usedHint = revealedHints > 0;
    const processResult = (isCorrect: boolean, correctAnswerText: string | null = null) => {
      const marks = (isCorrect && !usedHint) ? 4 : 0;
      const res: QuestionResult = {
        questionData: currQ,
        selectedOption: isMCQ ? selectedOption : -1,
        usedHint,
        isCorrect,
        correctAnswerLetter: (correctAnswerText as any) || null,
        marksEarned: marks
      };

      setResults(prev => [...prev, res]);

      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedOption(null);
        setNumericalAnswer("");
        setRevealedHints(0);
        setTimeElapsed(0);
      } else {
        setStage("evaluation");
      }
    };

    if (currQ.id) {
      let answerValue: string;
      
      if (isMCQ) {
        answerValue = OPTION_LETTERS[selectedOption!] || OPTION_LETTERS[0];
      } else {
        answerValue = numericalAnswer.trim();
      }

      apiRequest<AdaptiveSubmitResponse>(
        "/api/v1/adaptive-learning/submit",
        {
          method: "POST",
          body: JSON.stringify({
            submissions: [{ questionId: currQ.id, selectedAnswer: answerValue }]
          })
        },
        true
      )
        .then((result) => {
          const submissionResult = result.evaluatedSubmissions?.[0];
          processResult(Boolean(submissionResult?.isCorrect), submissionResult?.correctAnswer || null);
        })
        .catch(() => {
          // Fallback: compare locally
          if (isMCQ) {
            processResult(selectedOption === currQ.correctAnswerIndex);
          } else {
            processResult(
              numericalAnswer.toString().toLowerCase().trim() === 
              (currQ.numericalAnswer || "").toString().toLowerCase().trim()
            );
          }
        });
    } else {
      // No API call, compare locally
      if (isMCQ) {
        processResult(selectedOption === currQ.correctAnswerIndex);
      } else {
        processResult(
          numericalAnswer.toString().toLowerCase().trim() === 
          (currQ.numericalAnswer || "").toString().toLowerCase().trim()
        );
      }
    }
  };

  const revealNextHint = () => {
    if (revealedHints < 2) {
      setRevealedHints(prev => prev + 1);
    }
  };

  // Calculations for final evaluation
  const totalMarks = results.reduce((acc, r) => acc + r.marksEarned, 0);
  const questionsWithHints = results.filter(r => r.usedHint).length;
  const correctWithoutHints = results.filter(r => r.marksEarned === 4).length;
  const correct = results.filter(r => r.isCorrect).length;
  const incorrect = results.filter(r => !r.isCorrect).length;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 pb-12">
      {/* Hero Command Center */}
      <motion.div variants={fadeUp} className={`relative overflow-hidden rounded-3xl border ${courseColors.border} bg-gradient-to-br ${courseColors.bg} p-8 md:p-12`}>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500 to-lime-500 opacity-10 blur-3xl" />
        <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-cyan-500 opacity-5 blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className={`inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full ${courseColors.badge}`}>
            <Zap className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">{courseData.name} - Practice</span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-lime-400 to-green-400">Master {courseData.subjects.join(", ")}</h1>
          <p className="text-lg text-foreground/70 leading-relaxed">Practice {courseData.subjects.length} core subjects. Select a topic and difficulty to generate personalized questions. Perfect your answers for +4 marks or use hints for guidance.</p>
        </div>
      </motion.div>

      {/* Error State */}
      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-300">{errorMsg}</p>
            <p className="text-xs text-red-300/70 mt-1">Tip: Check if your Gemini API key in the backend .env is valid!</p>
          </div>
        </motion.div>
      )}

      {/* SELECTION STAGE */}
      {stage === "select" && (
        <motion.div variants={fadeUp} className="space-y-8">
          {/* Topic Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Select Topic</h2>
                <p className="text-sm text-muted-foreground">Choose what you want to practice today</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {topics.map((t, i) => (
                <motion.button
                  key={t}
                  onClick={() => setSelectedTopic(t)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative rounded-2xl p-4 font-semibold transition-all border overflow-hidden group ${
                    selectedTopic === t
                      ? "bg-gradient-to-br from-cyan-500 to-lime-500 text-black border-cyan-500/50 shadow-lg shadow-cyan-500/25"
                      : "glass-card border-border/60 text-foreground hover:border-cyan-500/40"
                  }`}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${selectedTopic !== t ? "bg-gradient-to-br from-cyan-500/10 to-lime-500/10" : ""}`} />
                  <span className="relative z-10 text-sm">{t}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Select Difficulty</h2>
                <p className="text-sm text-muted-foreground">Match your current skill level</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {difficulties.map((d, i) => {
                const diffColors = {
                  Easy: "from-emerald-500 to-green-500",
                  Medium: "from-amber-500 to-orange-500",
                  Hard: "from-red-500 to-pink-500",
                };
                return (
                  <motion.button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.06 }}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative rounded-2xl p-4 font-bold transition-all border overflow-hidden group ${
                      selectedDifficulty === d
                        ? `bg-gradient-to-br ${diffColors[d as keyof typeof diffColors]} text-white border-opacity-50 shadow-lg`
                        : "glass-card border-border/60 text-foreground hover:border-amber-500/40"
                    }`}
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${selectedDifficulty !== d ? `bg-gradient-to-br ${diffColors[d as keyof typeof diffColors]}/10` : ""}`} />
                    <span className="relative z-10">{d}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3 pt-4"
          >
            <Button
              onClick={startQuiz}
              disabled={!selectedTopic || !selectedDifficulty || loading}
              className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-cyan-500 to-lime-500 text-black hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
              {loading ? "Generating Questions..." : `Start ${selectedDifficulty} Practice`}
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* QUIZ STAGE */}
      {stage === "quiz" && questions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Quiz Header Stats */}
          <motion.div className="grid grid-cols-3 gap-3">
            {[
              { icon: Target, label: "Progress", value: `Q${currentQIndex + 1}/${questions.length}`, color: "from-cyan-500 to-blue-500" },
              { icon: Clock, label: "Time", value: `${timeElapsed}s`, color: "from-amber-500 to-orange-500" },
              { icon: TrendingUp, label: "Current Topic", value: selectedTopic, color: "from-lime-500 to-green-500" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05 }}
                whileHover={{ y: -2 }}
                className="glass-card rounded-2xl border border-border/50 p-3 relative overflow-hidden"
              >
                <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-2xl`} />
                <div className="relative z-10">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">{stat.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <stat.icon className="h-4 w-4 text-cyan-400" />
                    <p className="font-bold text-sm">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Question Card */}
          <motion.div
            key={currentQIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card rounded-3xl border border-cyan-500/30 p-8 space-y-6 relative overflow-hidden"
          >
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-500 to-lime-500 opacity-10 blur-3xl" />
            <div className="relative z-10">
              {/* Question Number and Difficulty Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/30 to-lime-500/30 border border-cyan-500/50 text-xs font-bold text-cyan-300 uppercase tracking-widest">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedDifficulty === "Easy"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : selectedDifficulty === "Medium"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-red-500/20 text-red-300"
                }`}>
                  {selectedDifficulty}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-2xl font-bold leading-relaxed mb-6">{questions[currentQIndex].question}</h2>

              {/* Answer Options - MCQ or Numerical */}
              {questions[currentQIndex].questionType === "MCQ" ? (
                // MCQ Options
                <div className="space-y-3 mb-8">
                  {questions[currentQIndex].options.map((opt, i) => (
                    <motion.button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      whileHover={{ x: 8 }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative w-full text-left rounded-2xl p-4 border-2 transition-all overflow-hidden group ${
                        selectedOption === i
                          ? "border-cyan-500 bg-gradient-to-r from-cyan-500/20 to-lime-500/20 shadow-lg shadow-cyan-500/20"
                          : "border-border/60 glass-card hover:border-cyan-500/40"
                      }`}
                    >
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${selectedOption !== i ? "bg-gradient-to-r from-cyan-500/10 to-lime-500/10" : ""}`} />
                      <div className="relative z-10 flex items-start gap-4">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 transition-all ${
                          selectedOption === i
                            ? "bg-gradient-to-br from-cyan-500 to-lime-500 text-black"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="flex-1 text-sm font-medium leading-relaxed">{opt}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                // Numerical Answer Input
                <div className="mb-8 space-y-3">
                  <label className="block text-sm font-semibold text-foreground/70">Enter your answer:</label>
                  <input
                    type="text"
                    value={numericalAnswer}
                    onChange={(e) => setNumericalAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-border/60 bg-muted/40 focus:border-cyan-500 focus:outline-none transition-all text-lg font-medium"
                  />
                  <p className="text-xs text-muted-foreground">
                    {questions[currentQIndex].questionType === "Numerical" 
                      ? "Enter a numerical value (units may be included)" 
                      : "Enter your short answer"}
                  </p>
                </div>
              )}

              {/* Hints Section */}
              <div className="border-t border-border/40 pt-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" /> Socratic Hints
                  </h3>
                  <span className="text-xs font-bold text-red-400 bg-red-500/20 px-3 py-1 rounded-full">-4 Marks if used</span>
                </div>

                {/* Hint 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl border border-border/40 p-4 bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {revealedHints >= 1 ? (
                        <p className="text-sm text-foreground">{questions[currentQIndex].hint1}</p>
                      ) : (
                        <span className="text-xs text-muted-foreground italic flex items-center gap-2">
                          <Clock className="h-3 w-3" /> Unlocks at 15 seconds
                        </span>
                      )}
                    </div>
                    {revealedHints === 0 && (
                      <Button
                        size="sm"
                        onClick={revealNextHint}
                        disabled={timeElapsed < 15}
                        className="shrink-0 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                        variant="outline"
                      >
                        Reveal
                      </Button>
                    )}
                  </div>
                </motion.div>

                {/* Hint 2 */}
                <AnimatePresence>
                  {revealedHints >= 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-2xl border border-border/40 p-4 bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {revealedHints >= 2 ? (
                            <p className="text-sm text-foreground">{questions[currentQIndex].hint2}</p>
                          ) : (
                            <span className="text-xs text-muted-foreground italic flex items-center gap-2">
                              <Clock className="h-3 w-3" /> Unlocks at 30 seconds
                            </span>
                          )}
                        </div>
                        {revealedHints === 1 && (
                          <Button
                            size="sm"
                            onClick={revealNextHint}
                            disabled={timeElapsed < 30}
                            className="shrink-0 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                            variant="outline"
                          >
                            Reveal
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Button
              onClick={submitAnswer}
              disabled={
                questions[currentQIndex].questionType === "MCQ"
                  ? selectedOption === null
                  : numericalAnswer.trim().length === 0
              }
              className="w-full h-12 text-base font-bold bg-gradient-to-r from-cyan-500 to-lime-500 text-black hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed gap-2"
            >
              {currentQIndex < questions.length - 1 ? "Submit & Next Question" : "Submit & Get Results"}
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* EVALUATION STAGE */}
      {stage === "evaluation" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-lime-500/30 bg-gradient-to-br from-lime-500/15 via-cyan-500/5 to-transparent p-8 md:p-12"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-lime-500 to-cyan-500 opacity-10 blur-3xl" />
            <div className="relative z-10 text-center space-y-4">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, delay: 0.3 }} className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-lime-500 to-green-600 text-white shadow-lg shadow-lime-500/30">
                <Trophy className="h-8 w-8" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-lime-400 via-cyan-400 to-green-400">
                Excellent Work!
              </h2>
              <p className="text-lg text-foreground/70">
                You've completed your {selectedTopic} {selectedDifficulty.toLowerCase()} practice challenge.
              </p>
            </div>
          </motion.div>

          {/* Score Metrics Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { icon: Trophy, label: "Total Marks", value: totalMarks, color: "from-lime-500 to-green-500", suffix: "" },
              { icon: CheckCircle2, label: "Perfect Answers", value: correctWithoutHints, color: "from-emerald-500 to-teal-500", suffix: "" },
              { icon: Lightbulb, label: "Hints Used", value: questionsWithHints, color: "from-amber-500 to-orange-500", suffix: "" },
              { icon: XCircle, label: "Incorrect", value: incorrect, color: "from-red-500 to-pink-500", suffix: "" },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`relative rounded-2xl bg-gradient-to-br ${metric.color} p-6 overflow-hidden group`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity" />
                <div className="relative z-10 space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur">
                    <metric.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-4xl font-black text-white">{metric.value}</p>
                  <p className="text-xs font-bold text-white/80 uppercase tracking-widest">{metric.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Solutions Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Brain className="h-6 w-6 text-cyan-400" /> Detailed Solutions
            </h2>

            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
              {results.map((r, i) => {
                const isCorrect = r.isCorrect;
                const serverCorrectIndex = r.correctAnswerLetter
                  ? OPTION_LETTERS.indexOf(r.correctAnswerLetter)
                  : r.questionData.correctAnswerIndex;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className={`relative rounded-2xl border overflow-hidden ${
                      isCorrect
                        ? "border-lime-500/30 bg-lime-500/5"
                        : "border-red-500/30 bg-red-500/5"
                    }`}
                  >
                    {/* Header */}
                    <div className="p-5 border-b border-border/40 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-muted-foreground mb-2">Question {i + 1}</p>
                        <h3 className="text-base font-bold leading-relaxed">{r.questionData.question}</h3>
                      </div>
                      <motion.div
                        animate={isCorrect ? { scale: [1, 1.2, 1] } : {}}
                        className={`shrink-0 px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 ${
                          isCorrect ? "bg-lime-500/20 text-lime-300" : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        {r.marksEarned > 0 ? "+4 Marks" : "0 Marks"}
                      </motion.div>
                    </div>

                    {/* Options Grid */}
                    <div className="p-5 grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">All Options</p>
                        {r.questionData.options.map((opt, optIdx) => {
                          const isCorrectOption = optIdx === serverCorrectIndex;
                          const isSelected = optIdx === r.selectedOption;
                          return (
                            <div
                              key={optIdx}
                              className={`relative rounded-xl p-3 text-sm border transition-all ${
                                isCorrectOption && isSelected
                                  ? "bg-lime-500/20 border-lime-500/50 font-medium text-lime-300"
                                  : isCorrectOption
                                    ? "bg-lime-500/10 border-lime-500/30 font-medium text-lime-300"
                                    : isSelected
                                      ? "bg-red-500/20 border-red-500/50 text-red-300"
                                      : "bg-muted/20 border-border/40 text-muted-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-bold">{String.fromCharCode(65 + optIdx)}</span>
                                <span>{opt}</span>
                                {isCorrectOption && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                                {isSelected && !isCorrectOption && <XCircle className="h-4 w-4 ml-auto" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Solution */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="relative rounded-2xl bg-gradient-to-br from-cyan-500/10 to-lime-500/10 border border-cyan-500/30 p-4 overflow-hidden"
                      >
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500 opacity-20 blur-2xl" />
                        <div className="relative z-10">
                          <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4" /> Step-by-Step Solution
                          </h4>
                          <p className="text-sm leading-relaxed text-foreground/80">{r.questionData.solution}</p>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button
              onClick={() => setStage("select")}
              className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-cyan-500 to-lime-500 text-black hover:shadow-lg hover:shadow-cyan-500/25 gap-2"
            >
              <Zap className="h-5 w-5" /> Take Another Practice Set
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12 text-base font-bold border-border/60 hover:bg-muted/50"
              onClick={() => setStage("select")}
            >
              Back to Dashboard
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

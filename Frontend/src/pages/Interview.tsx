import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, CheckCircle, BrainCircuit, UserCheck, PlayCircle, Loader2, Send, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

interface Report {
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: { question: string; feedback: string; idealApproach: string }[];
  finalVerdict: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function Interview() {
  const [stage, setStage] = useState<"setup" | "interview" | "report">("setup");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("UPSC IAS");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [qaPairs, setQaPairs] = useState<{question: string; answer: string}[]>([]);
  const [report, setReport] = useState<Report | null>(null);

  const startInterview = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<{ questions: string[] }>("/api/v1/interview/generate", {
        method: "POST",
        body: JSON.stringify({ role, topic: "Ethics and General Knowledge" })
      });
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setStage("interview");
      setCurrentQIndex(0);
      setQaPairs([]);
    } catch (err) {
      console.error(err);
      alert("Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    const newPairs = [...qaPairs, { question: questions[currentQIndex], answer: currentAnswer }];
    setQaPairs(newPairs);
    setCurrentAnswer("");

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setLoading(true);
      try {
        const data = await apiRequest<Report>("/api/v1/interview/evaluate", {
          method: "POST",
          body: JSON.stringify({ role, qaPairs: newPairs })
        });
        setReport(data);
        setStage("report");
      } catch (err) {
        console.error(err);
        alert("Failed to evaluate interview.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-4"
          >
            <UserCheck className="h-12 w-12 mx-auto text-primary" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3 py-2 leading-snug bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
            UPSC AI Interviewer
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Test your personality and analytical skills against an AI Interview Board
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {stage === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-background/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl border border-primary/10">
                    <h3 className="text-2xl font-bold mb-8 text-center">Select Your Target Service</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {["UPSC IAS", "UPSC IPS", "UPSC IFS", "UPSC IRS"].map((r, idx) => (
                        <motion.button
                          key={r}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          onClick={() => setRole(r)}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className={`relative p-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                            role === r
                              ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/50"
                              : "bg-background/50 border border-primary/20 text-foreground hover:border-primary/40 hover:bg-background/80"
                          }`}
                        >
                          {role === r && (
                            <motion.div
                              layoutId="roleIndicator"
                              className="absolute inset-0 rounded-xl border-2 border-white"
                              transition={{ duration: 0.3 }}
                            />
                          )}
                          <span className="relative z-10">{r}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex justify-center"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Button
                    onClick={startInterview}
                    disabled={loading}
                    className="relative px-10 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300 disabled:opacity-50 gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Preparing Interview Board...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-5 h-5" />
                        Start Board Interview
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {stage === "interview" && questions.length > 0 && (
            <motion.div key="interview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-primary">Question {currentQIndex + 1} of {questions.length}</span>
                  <span className="text-sm font-semibold text-muted-foreground">{role}</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden border border-primary/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="mb-8"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-background/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl border border-blue-400/20">
                    <div className="flex items-start gap-4">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="flex-shrink-0"
                      >
                        <BrainCircuit className="h-8 w-8 text-blue-500" />
                      </motion.div>
                      <p className="text-lg sm:text-xl font-semibold leading-relaxed text-foreground">
                        {questions[currentQIndex]}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="space-y-4"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-background/80 backdrop-blur-xl p-8 rounded-2xl border border-purple-400/20">
                    <label className="text-sm font-bold mb-4 flex items-center gap-2 text-foreground">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Mic className="w-5 h-5 text-purple-500" />
                      </motion.div>
                      Your Answer
                    </label>
                    <textarea
                      value={currentAnswer}
                      onChange={e => setCurrentAnswer(e.target.value)}
                      disabled={loading}
                      placeholder="Speak your answer with confidence and clarity. Type your detailed response here..."
                      className="w-full h-48 bg-background/50 border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none transition-all placeholder:text-muted-foreground/50"
                    />
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{currentAnswer.length} characters</span>
                      <span>Min. 50 characters recommended</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/40 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                    <Button
                      onClick={nextQuestion}
                      disabled={currentAnswer.trim() === "" || loading}
                      className="relative px-8 py-3 font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300 disabled:opacity-50 gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {currentQIndex === questions.length - 1 ? "Submit for Evaluation" : "Next Question"}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {stage === "report" && report && (
            <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 via-orange-400/40 to-red-400/40 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-background/80 backdrop-blur-xl p-8 sm:p-12 rounded-2xl border border-yellow-400/20">
                  <div className="flex flex-col sm:flex-row items-center gap-8 justify-between">
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500">
                        Interview Evaluation Report
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                        {report.finalVerdict}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="flex-shrink-0"
                    >
                      <div className="w-40 h-40 rounded-full border-4 border-gradient bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-accent/10"></div>
                        <div className="relative text-center">
                          <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500">
                            {report.overallScore}
                          </span>
                          <span className="block text-sm font-semibold text-muted-foreground mt-1">/ 100</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid lg:grid-cols-2 gap-8"
              >
                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="group">
                  <div className="relative h-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative bg-background/80 backdrop-blur-xl p-8 rounded-2xl border border-green-400/20 h-full">
                      <motion.h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <CheckCircle className="w-7 h-7 text-green-500" />
                        </motion.div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
                          Key Strengths
                        </span>
                      </motion.h3>
                      <ul className="space-y-3">
                        {report.strengths.map((s, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-all"
                          >
                            <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                            <span className="text-sm text-foreground">{s}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="group">
                  <div className="relative h-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-400/30 to-orange-400/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative bg-background/80 backdrop-blur-xl p-8 rounded-2xl border border-amber-400/20 h-full">
                      <motion.h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, -15, 15, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Target className="w-7 h-7 text-amber-500" />
                        </motion.div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">
                          Areas for Improvement
                        </span>
                      </motion.h3>
                      <ul className="space-y-3">
                        {report.areasForImprovement.map((a, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-all"
                          >
                            <span className="text-amber-500 font-bold flex-shrink-0">→</span>
                            <span className="text-sm text-foreground">{a}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="group">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative bg-background/80 backdrop-blur-xl p-8 rounded-2xl border border-blue-400/20">
                    <motion.h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="w-7 h-7 text-blue-500" />
                      </motion.div>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
                        Detailed Answer Feedback
                      </span>
                    </motion.h3>
                    <div className="space-y-6">
                      {report.detailedFeedback.map((fb, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.15 }}
                          className="border-b border-border pb-6 last:border-0 last:pb-0"
                        >
                          <div className="flex items-start gap-3 mb-4">
                            <span className="text-sm font-bold text-blue-600 bg-blue-500/10 px-3 py-1 rounded-lg">Q{idx + 1}</span>
                            <p className="font-semibold text-foreground leading-relaxed flex-1">{fb.question}</p>
                          </div>

                          {qaPairs[idx] && (
                            <div className="mb-4 p-4 rounded-lg bg-background/50 border border-blue-500/20">
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Your Answer</p>
                              <p className="text-sm text-muted-foreground italic">"{qaPairs[idx].answer}"</p>
                            </div>
                          )}

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 p-4 rounded-xl">
                              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">Feedback</span>
                              <p className="text-sm text-foreground leading-relaxed">{fb.feedback}</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 p-4 rounded-xl">
                              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 block">Ideal Approach</span>
                              <p className="text-sm text-foreground leading-relaxed">{fb.idealApproach}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center pt-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setStage("setup")}
                  className="relative group px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                  <span className="relative z-10 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Retake Interview
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

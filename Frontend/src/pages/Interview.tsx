import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, CheckCircle, BrainCircuit, UserCheck, PlayCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";

interface Report {
  overallScore: number;
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: { question: string; feedback: string; idealApproach: string }[];
  finalVerdict: string;
}

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
      // Evaluate
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <UserCheck className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">UPSC AI Interviewer</h1>
          <p className="text-sm text-muted-foreground">Test your personality and analytical skills against an AI Board.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === "setup" && (
          <motion.div key="setup" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="glass-card p-6 mt-6">
             <h3 className="font-semibold mb-4 text-lg">Select Your Target Service</h3>
             <div className="flex gap-3 mb-6">
                {["UPSC IAS", "UPSC IPS", "UPSC IFS", "UPSC IRS"].map(r => (
                  <button 
                     key={r} 
                     onClick={() => setRole(r)}
                     className={`px-4 py-2 rounded-lg text-sm transition-all ${role === r ? 'gradient-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-muted/80'}`}
                  >
                     {r}
                  </button>
                ))}
             </div>
             
             <Button onClick={startInterview} disabled={loading} variant="gradient" className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <PlayCircle className="w-4 h-4"/>}
                {loading ? "Preparing Interview Board..." : "Start Board Interview"}
             </Button>
          </motion.div>
        )}

        {stage === "interview" && questions.length > 0 && (
          <motion.div key="interview" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="glass-card p-6">
             <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">Question {currentQIndex + 1} of {questions.length}</span>
                <span className="text-xs font-semibold text-muted-foreground">{role} Board</span>
             </div>

             <div className="bg-muted/30 p-6 rounded-xl mb-6 relative hover-glow border border-primary/10">
                <div className="absolute top-4 left-4 opacity-10"><BrainCircuit className="w-16 h-16"/></div>
                <p className="text-lg font-medium leading-relaxed z-10 relative">"{questions[currentQIndex]}"</p>
             </div>

             <div className="space-y-4 relative z-10">
                <label className="text-sm font-semibold flex items-center gap-2">
                   <Mic className="w-4 h-4 text-muted-foreground"/> Your Answer:
                </label>
                <textarea 
                   value={currentAnswer}
                   onChange={e => setCurrentAnswer(e.target.value)}
                   disabled={loading}
                   placeholder="Type your detailed answer here... (Speak clearly and confidently in your mind as you type)"
                   className="w-full h-40 bg-background/50 border border-border rounded-lg p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all placeholder:text-muted-foreground/50"
                />
                
                <div className="flex justify-end">
                  <Button onClick={nextQuestion} disabled={currentAnswer.trim() === "" || loading} variant="gradient" className="w-full md:w-auto">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Send className="w-4 h-4 mr-2"/>}
                    {currentQIndex === questions.length - 1 ? (loading ? "Evaluating..." : "Submit for Evaluation") : "Next Question"}
                  </Button>
                </div>
             </div>
          </motion.div>
        )}

        {stage === "report" && report && (
          <motion.div key="report" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="space-y-6">
             {/* Score Card */}
             <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div>
                   <h2 className="text-2xl font-bold mb-2 text-primary">Interview Evaluation Report</h2>
                   <p className="text-muted-foreground mb-4">{report.finalVerdict}</p>
                </div>
                <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center shrink-0 relative flex-col">
                   <span className="text-3xl font-black text-primary">{report.overallScore}</span>
                   <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
             </div>

             {/* Strengths and Weaknesses */}
             <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="font-semibold text-success mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5"/> Key Strengths</h3>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      {report.strengths.map((s,i) => <li key={i} className="flex gap-2"><span className="text-success mt-0.5">•</span> {s}</li>)}
                    </ul>
                </div>
                <div className="glass-card p-6 border-warning/20">
                    <h3 className="font-semibold text-warning mb-4 flex items-center gap-2"><BrainCircuit className="w-5 h-5"/> Areas for Improvement</h3>
                    <ul className="space-y-2 text-sm text-foreground/80">
                      {report.areasForImprovement.map((a,i) => <li key={i} className="flex gap-2"><span className="text-warning mt-0.5">•</span> {a}</li>)}
                    </ul>
                </div>
             </div>

             {/* Detailed Feedback */}
             <div className="glass-card p-6">
                <h3 className="text-xl font-bold mb-6">Detailed Answer Feedback</h3>
                <div className="space-y-8">
                   {report.detailedFeedback.map((fb, idx) => (
                      <div key={idx} className="border-b border-border pb-6 last:border-0 last:pb-0">
                         <p className="font-semibold text-sm mb-2 text-primary">Q{idx+1}: {fb.question}</p>
                         <p className="text-xs text-muted-foreground bg-muted/30 p-3 rounded mb-3 border-l-2 border-primary">
                           " {qaPairs[idx]?.answer} "
                         </p>
                         <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-primary/5 p-4 rounded-lg">
                               <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">Feedback</span>
                               <p className="text-sm">{fb.feedback}</p>
                            </div>
                            <div className="bg-success/5 p-4 rounded-lg">
                               <span className="text-xs font-bold text-success uppercase tracking-wider mb-2 block">Ideal Approach</span>
                               <p className="text-sm">{fb.idealApproach}</p>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="flex justify-end mt-6">
                <Button onClick={() => setStage("setup")} variant="outline">Retake Interview</Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

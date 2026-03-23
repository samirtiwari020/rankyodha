import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, BookOpen, Clock, PlusCircle, Trophy, Flame, Target, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { useCourse } from "@/contexts/CourseContext";
import { getCourseData, getCourseColorScheme } from "@/utils/courseData";
import { useLocation } from "react-router-dom";

interface AITask {
  topic: string;
  type: "learn" | "revise" | "practice";
  hours: number;
  reason: string;
}

interface AIDayPlan {
  day: number;
  tasks: AITask[];
}

interface StudyPlanResponse {
  success: boolean;
  message: string;
  plan: AIDayPlan[];
}

const normalizeTopics = (value: string[]) =>
  value
    .map((topic) => topic.trim())
    .filter(Boolean)
    .filter((topic, index, arr) => arr.findIndex((t) => t.toLowerCase() === topic.toLowerCase()) === index);

const ADAPTIVE_WEAK_TOPICS_KEY = "adaptivePracticeWeakTopics";
const SPACED_REVISION_TOPICS_KEY = "spacedRepetitionTopics";

const parseTopicsPayload = (payload: unknown): string[] => {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is string => typeof item === "string");
  }
  if (payload && typeof payload === "object" && Array.isArray((payload as { topics?: unknown }).topics)) {
    return ((payload as { topics: unknown[] }).topics).filter((item): item is string => typeof item === "string");
  }
  return [];
};

const getSlotTone = (type: AITask["type"]) => {
  if (type === "learn") return "bg-cyan-500/10 border-cyan-500/30 text-cyan-300";
  if (type === "practice") return "bg-lime-500/10 border-lime-500/30 text-lime-300";
  if (type === "revise") return "bg-amber-500/10 border-amber-500/30 text-amber-300";
  return "bg-secondary/40 border-secondary";
};

export default function StudyPlanner() {
  const location = useLocation();
  const { selectedCourse } = useCourse();
  const courseData = getCourseData(selectedCourse);
  const courseColors = getCourseColorScheme(selectedCourse);
  const courseToExamMap: Record<string, string> = {
    jee: "JEE",
    neet: "NEET",
    upsc: "UPSC",
  };
  
  const [title, setTitle] = useState("");
  const [examSelection, setExamSelection] = useState(courseToExamMap[selectedCourse] || "JEE");
  const [daysLeft, setDaysLeft] = useState("");
  const [dailyStudyHours, setDailyStudyHours] = useState("2");
  const [weakTopics, setWeakTopics] = useState("");
  
  const [generatedPlan, setGeneratedPlan] = useState<AIDayPlan[] | null>(null);
  
  const [revisionTopics, setRevisionTopics] = useState<string[]>([]);
  const [externalWeakTopics, setExternalWeakTopics] = useState<string[]>([]);
  const [externalRevisionTopics, setExternalRevisionTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setExamSelection(courseToExamMap[selectedCourse] || "JEE");
  }, [selectedCourse]);

  useEffect(() => {
    const fetchRevisionTopics = async () => {
      try {
        const revisionData = await apiRequest<Array<{ topic?: string }>>(
          "/api/v1/revision",
          { method: "GET" },
          true
        );
        const topics = Array.isArray(revisionData)
          ? revisionData
              .map((item) => item.topic || "")
              .filter(Boolean)
          : [];
        setRevisionTopics(normalizeTopics(topics));
      } catch {
        // Keep planner resilient if revision module is unavailable or unauthenticated.
        setRevisionTopics([]);
      }
    };

    fetchRevisionTopics();
  }, []);

  useEffect(() => {
    const stateWeakTopics = parseTopicsPayload((location.state as { weakTopics?: unknown } | null)?.weakTopics);
    const stateRevisionTopics = parseTopicsPayload((location.state as { revisionTopics?: unknown } | null)?.revisionTopics);

    const storageWeakTopics = parseTopicsPayload(
      (() => {
        try {
          const raw = localStorage.getItem(ADAPTIVE_WEAK_TOPICS_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      })()
    );

    const storageRevisionTopics = parseTopicsPayload(
      (() => {
        try {
          const raw = localStorage.getItem(SPACED_REVISION_TOPICS_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      })()
    );

    setExternalWeakTopics(normalizeTopics([...stateWeakTopics, ...storageWeakTopics]));
    setExternalRevisionTopics(normalizeTopics([...stateRevisionTopics, ...storageRevisionTopics]));
  }, [location.state]);

  useEffect(() => {
    const onWeakTopicsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const topics = normalizeTopics(parseTopicsPayload(customEvent.detail));
      setExternalWeakTopics(topics);
    };

    const onRevisionTopicsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const topics = normalizeTopics(parseTopicsPayload(customEvent.detail));
      setExternalRevisionTopics(topics);
    };

    window.addEventListener("adaptive-practice:weak-topics-updated", onWeakTopicsUpdated);
    window.addEventListener("spaced-revision:topics-updated", onRevisionTopicsUpdated);

    return () => {
      window.removeEventListener("adaptive-practice:weak-topics-updated", onWeakTopicsUpdated);
      window.removeEventListener("spaced-revision:topics-updated", onRevisionTopicsUpdated);
    };
  }, []);

  // Auto-rebalance when weak/revision topics change
  useEffect(() => {
    // Only auto-rebalance if a plan already exists
    if (!generatedPlan || generatedPlan.length === 0) return;

    const rebalance = async () => {
      const manualTopics = weakTopics
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const mergedWeakTopics = normalizeTopics([...manualTopics, ...externalWeakTopics]);
      const mergedRevisionTopics = normalizeTopics([...revisionTopics, ...externalRevisionTopics]);

      setIsRebalancing(true);
      try {
        const response = await apiRequest<StudyPlanResponse>(
          "/api/rebalance-plan",
          {
            method: "POST",
            body: JSON.stringify({
              existingPlan: generatedPlan,
              weakTopics: mergedWeakTopics,
              revisionTopics: mergedRevisionTopics,
            })
          },
          false
        );
        if (response.success && response.plan) {
          setGeneratedPlan(response.plan);
        }
      } catch (err) {
        console.error("Failed to rebalance AI plan:", err);
      } finally {
        setIsRebalancing(false);
      }
    };

    // Debounce the AI call drastically so it doesn't spam on every keystroke and exhaust the 20/min Free Tier limit
    const timer = setTimeout(() => {
      rebalance();
    }, 4000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weakTopics, externalWeakTopics, revisionTopics, externalRevisionTopics]);

  const isWeakTopic = (topic: string) => {
    const allWeak = normalizeTopics([
      ...weakTopics.split(","),
      ...externalWeakTopics,
      ...externalRevisionTopics
    ]);
    if (allWeak.length === 0) return false;
    return allWeak.some(w => topic.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(topic.toLowerCase()));
  };

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const manualTopics = weakTopics
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const mergedWeakTopics = normalizeTopics([...manualTopics, ...externalWeakTopics]);

    if (!mergedWeakTopics.length && !externalRevisionTopics.length) {
      setError("Please add at least one weak topic so the AI can prioritize for you.");
      return;
    }

    const safeDaysLeft = Number(daysLeft || 0);
    const safeDailyHours = Math.max(1, Number(dailyStudyHours || 1));

    setIsLoading(true);
    setError("");
    setGeneratedPlan(null);
    try {
      const response = await apiRequest<StudyPlanResponse>(
        "/api/study-plan/generate",
        {
          method: "POST",
          body: JSON.stringify({
            exam: examSelection,
            daysLeft: safeDaysLeft,
            dailyHours: safeDailyHours,
            weakTopics: normalizeTopics([...mergedWeakTopics, ...externalRevisionTopics]),
          })
        },
        false
      );
      setGeneratedPlan(response.plan);

      setTitle("");
      setDaysLeft("");
      setDailyStudyHours("2");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border ${courseColors.border} bg-gradient-to-br ${courseColors.bg} p-6`}>
        <h1 className="text-3xl font-black">{courseData.name} - AI Study Planner</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a personalized, dynamic AI study schedule for {courseData.subjects.join(", ")}.
        </p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={createPlan} className="space-y-4 rounded-2xl border border-border/60 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Selection</label>
            <select
              value={examSelection}
              onChange={(e) => setExamSelection(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="JEE">JEE</option>
              <option value="NEET">NEET</option>
              <option value="UPSC">UPSC</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional custom plan title" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Days Left</label>
            <Input
              type="number"
              min={1}
              value={daysLeft}
              onChange={(e) => setDaysLeft(e.target.value)}
              placeholder="e.g., 90"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Daily Study Hours</label>
            <Input
              type="number"
              min={1}
              max={16}
              step="0.5"
              value={dailyStudyHours}
              onChange={(e) => setDailyStudyHours(e.target.value)}
              placeholder="e.g., 6"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Weak Topics (comma separated)</label>
          <Input
            value={weakTopics}
            onChange={(e) => setWeakTopics(e.target.value)}
            placeholder={`e.g., ${courseData.subjects.join(", ")}`}
          />
          {(externalWeakTopics.length > 0 || externalRevisionTopics.length > 0) && (
            <p className="text-xs text-muted-foreground">
              External inputs active: {externalWeakTopics.length} weak topic(s), {normalizeTopics([...revisionTopics, ...externalRevisionTopics]).length} revision topic(s).
            </p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-cyan-500 to-lime-500 text-black">
          <PlusCircle className="mr-2 h-4 w-4" />
          {isLoading ? "Generating AI Plan..." : "Generate Plan"}
        </Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </motion.form>

      <div className="space-y-4">
        {generatedPlan && Array.isArray(generatedPlan) ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-cyan-950/10 p-5 md:p-6 space-y-5 transition-all duration-500 ${isRebalancing ? 'opacity-60 blur-[1px]' : 'opacity-100'}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl md:text-2xl font-black inline-flex items-center gap-2">
                <Trophy className="h-5 w-5 text-lime-400" /> AI Generated Study Plan
              </h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {isRebalancing && (
                  <span className="inline-flex items-center gap-1.5 text-cyan-400 font-bold animate-pulse bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                    <Sparkles className="h-3 w-3 animate-pulse" /> Rebalancing...
                  </span>
                )}
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {generatedPlan.length} days</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Tailored strategy prioritizing your weak areas with balanced practice and revision.</p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4">
              {generatedPlan.map((day, dayIndex) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.05 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="rounded-2xl border border-border/60 bg-card/70 p-4 md:p-5 shadow-sm flex flex-col h-full"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <p className="font-bold text-lg">Day {day.day}</p>
                    <span className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide bg-primary/20 text-primary font-bold inline-flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> AI Planned
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col">
                    {day.tasks.map((task, index) => {
                      const isWeak = isWeakTopic(task.topic);
                      return (
                        <motion.div
                          key={`${day.day}-${task.type}-${index}`}
                          whileHover={{ scale: 1.01 }}
                          className={`rounded-xl border p-4 flex-1 ${getSlotTone(task.type)} transition-colors relative overflow-hidden`}
                        >
                          {isWeak && (
                            <div className="absolute top-0 right-0 rounded-bl-xl bg-rose-500/20 px-2 py-0.5 flex items-center gap-1 border-b border-l border-rose-500/30 text-[9px] uppercase tracking-wider font-bold text-rose-400">
                              <AlertCircle className="h-3 w-3" /> Priority
                            </div>
                          )}

                          <div className="flex items-center justify-between gap-2 mt-2 mb-2">
                            <p className="text-[11px] uppercase tracking-wider font-bold">
                              {task.type === "learn" && <BookOpen className="inline-block mr-1 h-3.5 w-3.5" />}
                              {task.type === "practice" && <Target className="inline-block mr-1 h-3.5 w-3.5" />}
                              {task.type === "revise" && <Flame className="inline-block mr-1 h-3.5 w-3.5" />}
                              {task.type}
                            </p>
                            <p className="text-[11px] font-semibold flex items-center gap-1 opacity-80">
                              <Clock className="h-3 w-3" /> {task.hours} hr
                            </p>
                          </div>
                          
                          <p className={`font-semibold text-sm ${isWeak ? 'text-rose-100' : 'text-foreground'}`}>
                            {task.topic}
                          </p>
                          <div className="mt-3 rounded-md bg-background/50 shadow-sm border border-primary/10 p-2.5">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-500 flex items-center gap-1.5 mb-1">
                              <Sparkles className="h-3 w-3" /> Why this topic?
                            </span>
                            <p className="text-xs text-muted-foreground/90 leading-relaxed italic">
                              {task.reason}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          !error && <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-center text-muted-foreground flex flex-col items-center justify-center min-h-[150px]">
            <Sparkles className="h-6 w-6 mb-3 opacity-20" />
            <p>No generated plan yet. Fill details and click Generate Plan.</p>
          </div>
        )}
      </div>
    </div>
  );
}

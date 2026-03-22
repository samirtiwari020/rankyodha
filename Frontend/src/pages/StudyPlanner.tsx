import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, BookOpen, Clock, PlusCircle, Trophy, Flame, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { useCourse } from "@/contexts/CourseContext";
import { getCourseData, getCourseColorScheme } from "@/utils/courseData";
import { useLocation } from "react-router-dom";

interface StudyPlanSlot {
  type: "learning" | "practice" | "revision";
  topic: string;
  durationHours: number;
  note: string;
}

interface StudyPlanDay {
  day: number;
  date: string;
  focus: string;
  slots: StudyPlanSlot[];
  totalHours: number;
}

interface GeneratedStudyPlan {
  exam: string;
  daysLeft: number;
  dailyHours: number;
  summary: {
    planDays: number;
    strategy: string;
    split: {
      learningHours: number;
      practiceHours: number;
      revisionHours: number;
    };
  };
  days: StudyPlanDay[];
}

interface StudyPlanResponse {
  success: boolean;
  message: string;
  plan: GeneratedStudyPlan;
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

export const rebalancePlan = (
  plan: GeneratedStudyPlan,
  weakTopics: string[],
  revisionTopics: string[]
): GeneratedStudyPlan => {
  const normalizedWeakTopics = normalizeTopics(weakTopics);
  const normalizedRevisionTopics = normalizeTopics(revisionTopics);

  if (!normalizedWeakTopics.length && !normalizedRevisionTopics.length) {
    return plan;
  }

  const weakPool = normalizedWeakTopics.length ? normalizedWeakTopics : ["Core Concepts"];
  const revisionPool = normalizedRevisionTopics.length ? normalizedRevisionTopics : weakPool;

  const rebalancedDays = plan.days.map((day, dayIndex) => {
    const usedTopics = new Set<string>();

    const updatedSlots = day.slots.map((slot, slotIndex) => {
      let updatedTopic = slot.topic;

      if (slot.type === "revision") {
        updatedTopic = revisionPool[dayIndex % revisionPool.length];
      } else {
        // Weak topics get repeated more frequently by selecting from the weak pool.
        const weakCandidate = weakPool[(dayIndex + slotIndex) % weakPool.length];
        updatedTopic = weakCandidate;
      }

      if (usedTopics.has(updatedTopic.toLowerCase())) {
        const fallback = `${updatedTopic} - drill`;
        updatedTopic = fallback;
      }

      usedTopics.add(updatedTopic.toLowerCase());

      return {
        ...slot,
        topic: updatedTopic,
      };
    });

    const totalAllocated = updatedSlots.reduce((sum, slot) => sum + slot.durationHours, 0);
    if (totalAllocated > day.totalHours && updatedSlots.length > 0) {
      const overflow = Number((totalAllocated - day.totalHours).toFixed(2));
      const lastSlot = updatedSlots[updatedSlots.length - 1];
      lastSlot.durationHours = Number(Math.max(0.5, lastSlot.durationHours - overflow).toFixed(2));
    }

    return {
      ...day,
      slots: updatedSlots,
    };
  });

  return {
    ...plan,
    summary: {
      ...plan.summary,
      strategy: `${plan.summary.strategy}. Auto-rebalanced for weak and revision topics.`,
    },
    days: rebalancedDays,
  };
};

const getSlotTone = (type: StudyPlanSlot["type"]) => {
  if (type === "learning") return "bg-cyan-500/10 border-cyan-500/30 text-cyan-300";
  if (type === "practice") return "bg-lime-500/10 border-lime-500/30 text-lime-300";
  return "bg-amber-500/10 border-amber-500/30 text-amber-300";
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
  const [basePlan, setBasePlan] = useState<GeneratedStudyPlan | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedStudyPlan | null>(null);
  const [revisionTopics, setRevisionTopics] = useState<string[]>([]);
  const [externalWeakTopics, setExternalWeakTopics] = useState<string[]>([]);
  const [externalRevisionTopics, setExternalRevisionTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (!basePlan) {
      setGeneratedPlan(null);
      return;
    }

    const manualWeakTopicList = weakTopics
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const mergedWeakTopics = normalizeTopics([...manualWeakTopicList, ...externalWeakTopics]);
    const mergedRevisionTopics = normalizeTopics([...revisionTopics, ...externalRevisionTopics]);

    setGeneratedPlan(rebalancePlan(basePlan, mergedWeakTopics, mergedRevisionTopics));
  }, [basePlan, weakTopics, revisionTopics, externalWeakTopics, externalRevisionTopics]);

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const manualTopics = weakTopics
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const mergedWeakTopics = normalizeTopics([...manualTopics, ...externalWeakTopics]);

    if (!mergedWeakTopics.length) {
      setError("Please add at least one weak topic");
      return;
    }

    const safeDaysLeft = Number(daysLeft || 0);
    const safeDailyHours = Math.max(1, Number(dailyStudyHours || 1));

    setIsLoading(true);
    setError("");
    setBasePlan(null);
    setGeneratedPlan(null);
    try {
      const response = await apiRequest<StudyPlanResponse>(
        "/api/study-plan",
        {
          method: "POST",
          body: JSON.stringify({
            exam: examSelection,
            daysLeft: safeDaysLeft,
            dailyHours: safeDailyHours,
            weakTopics: mergedWeakTopics,
          })
        },
        false
      );
      setBasePlan(response.plan);

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
        <h1 className="text-3xl font-black">{courseData.name} - Study Planner</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a personalized study schedule for {courseData.subjects.join(", ")}. Organize topics, set goals, and track progress.
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
          {isLoading ? "Generating..." : "Generate Plan"}
        </Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </motion.form>

      <div className="space-y-4">
        {generatedPlan ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/60 bg-gradient-to-br from-background via-background to-cyan-950/10 p-5 md:p-6 space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl md:text-2xl font-black inline-flex items-center gap-2">
                <Trophy className="h-5 w-5 text-lime-400" /> {generatedPlan.exam} 5-Day Plan
              </h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {generatedPlan.summary.planDays} days</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {generatedPlan.dailyHours}h/day</span>
                <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> {generatedPlan.daysLeft} days left</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{generatedPlan.summary.strategy}</p>

            <div className="grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2.5 inline-flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-medium"><BookOpen className="h-3.5 w-3.5" /> Learning</span>
                <span className="font-semibold">{generatedPlan.summary.split.learningHours}h</span>
              </div>
              <div className="rounded-xl border border-lime-500/30 bg-lime-500/10 px-3 py-2.5 inline-flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-medium"><Target className="h-3.5 w-3.5" /> Practice</span>
                <span className="font-semibold">{generatedPlan.summary.split.practiceHours}h</span>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 inline-flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-medium"><Flame className="h-3.5 w-3.5" /> Revision</span>
                <span className="font-semibold">{generatedPlan.summary.split.revisionHours}h</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {generatedPlan.days.map((day, dayIndex) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.05 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="rounded-2xl border border-border/60 bg-card/70 p-4 md:p-5 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-base">Day {day.day}</p>
                    <span className="rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide bg-secondary/70 text-muted-foreground">
                      {day.focus}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(day.date).toLocaleDateString()} • {day.totalHours} total hours</p>

                  <div className="mt-3 space-y-2.5">
                    {day.slots.map((slot, index) => (
                      <motion.div
                        key={`${day.day}-${slot.type}-${index}`}
                        whileHover={{ scale: 1.01 }}
                        className={`rounded-xl border p-3 ${getSlotTone(slot.type)} transition-colors`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] uppercase tracking-wide font-semibold">{slot.type}</p>
                          <p className="text-[11px] font-semibold">{slot.durationHours}h</p>
                        </div>
                        <p className="font-semibold inline-flex items-center gap-1 mt-1.5 text-sm text-foreground">
                          <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                          {slot.topic}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{slot.note}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          !error && <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">No generated plan yet. Fill details and click Generate Plan.</div>
        )}
      </div>
    </div>
  );
}

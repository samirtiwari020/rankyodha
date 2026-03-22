import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Sparkles, BookOpen, Clock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

interface PlanTopic {
  name: string;
  hoursPerWeek: number;
}

interface StudyPlan {
  _id: string;
  title: string;
  examDate?: string;
  topics: PlanTopic[];
  strategy: string;
  createdAt: string;
}

export default function StudyPlanner() {
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [topicsInput, setTopicsInput] = useState("");
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlans = async () => {
    try {
      const data = await apiRequest<StudyPlan[]>("/api/v1/planner", { method: "GET" }, true);
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const createPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Plan title is required");
      return;
    }

    const topics = topicsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => ({ name, hoursPerWeek: 2 }));

    setIsLoading(true);
    setError("");
    try {
      await apiRequest<StudyPlan>(
        "/api/v1/planner",
        {
          method: "POST",
          body: JSON.stringify({
            title,
            examDate: examDate || undefined,
            topics
          })
        },
        true
      );

      setTitle("");
      setExamDate("");
      setTopicsInput("");
      await fetchPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-lime-500/10 p-6">
        <h1 className="text-3xl font-black">Study Planner</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create plans and load your saved plans from database-backed backend APIs.</p>
      </motion.div>

      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={createPlan} className="space-y-4 rounded-2xl border border-border/60 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="UPSC 90-day Plan" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Date</label>
            <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Topics (comma separated)</label>
          <Input value={topicsInput} onChange={(e) => setTopicsInput(e.target.value)} placeholder="Polity, Economy, Modern History" />
        </div>
        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-cyan-500 to-lime-500 text-black">
          <PlusCircle className="mr-2 h-4 w-4" />
          {isLoading ? "Creating..." : "Create Plan"}
        </Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </motion.form>

      <div className="space-y-4">
        {plans.map((plan) => (
          <motion.div key={plan._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">{plan.title}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {plan.examDate ? new Date(plan.examDate).toLocaleDateString() : "No exam date"}</span>
                <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> {new Date(plan.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{plan.strategy || "No strategy available"}</p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {plan.topics.map((topic) => (
                <div key={`${plan._id}-${topic.name}`} className="rounded-xl border border-border/50 px-3 py-2 text-sm">
                  <div className="inline-flex items-center gap-2 font-medium"><BookOpen className="h-4 w-4 text-cyan-400" />{topic.name}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {topic.hoursPerWeek} hrs/week</div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {plans.length === 0 && !error && (
          <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">No plans yet. Create your first study plan.</div>
        )}
      </div>
    </div>
  );
}

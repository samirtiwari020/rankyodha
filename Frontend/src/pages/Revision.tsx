import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { CalendarClock, CheckCircle2, Circle, Brain, Target, Clock3, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const SM2_RATINGS = [
  { value: 0, label: "0 - Complete Blackout", color: "text-red-500", bg: "bg-red-500/10 hover:bg-red-500/20 border-red-500/30" },
  { value: 1, label: "1 - Incorrect, but familiar", color: "text-orange-500", bg: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30" },
  { value: 2, label: "2 - Incorrect, seemed easy", color: "text-amber-500", bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30" },
  { value: 3, label: "3 - Correct, hard effort", color: "text-lime-500", bg: "bg-lime-500/10 hover:bg-lime-500/20 border-lime-500/30" },
  { value: 4, label: "4 - Correct, with hesitation", color: "text-emerald-500", bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30" },
  { value: 5, label: "5 - Perfect Response", color: "text-cyan-500", bg: "bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30" },
];

type RevisionItem = {
  _id: string;
  topic: string;
  confidence: number;
  nextRevisionAt: string;
};

export default function Revision() {
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [topic, setTopic] = useState("");
  const [rating, setRating] = useState(3);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadRevisions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<RevisionItem[]>("/api/v1/revision", { method: "GET" }, true);
      setRevisions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load revisions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevisions();
  }, []);

  const addRevision = async () => {
    if (!topic.trim()) {
      setError("Topic is required");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await apiRequest<RevisionItem>(
        "/api/v1/revision",
        {
          method: "POST",
          body: JSON.stringify({ topic: topic.trim(), confidence: rating }),
        },
        true
      );
      setTopic("");
      setRating(3);
      await loadRevisions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add revision");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = revisions.length;
    const dueRevisions = revisions.filter(r => new Date(r.nextRevisionAt) <= new Date()).length;
    const pending = total; // In SM-2, learning is continuous.
    const subjects = new Set(revisions.map((r) => r.topic.split("-")[0].trim())).size;
    const completionRate = total ? Math.round(((total - dueRevisions) / total) * 100) : 0;
    return { total, dueRevisions, pending, subjects, completionRate };
  }, [revisions]);

  if (loading) {
    return <div className="max-w-6xl mx-auto">Loading revisions...</div>;
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 pb-10">
      <motion.div variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-lime-500/5 to-transparent p-8 md:p-10">
        <h1 className="text-4xl font-black md:text-5xl">Revision Planner</h1>
        <p className="mt-2 text-sm text-foreground/75 md:text-base">All revision cards are loaded from your backend revision schedule.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-border/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold">Review a Topic</h3>
        <p className="text-xs text-muted-foreground mb-2">How well did you remember this concept? The AI will schedule your next review based on your rating.</p>
        
        <div className="grid gap-3">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Thermodynamics - 2nd Law" className="max-w-md" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-2xl mt-2">
            {SM2_RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRating(r.value)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                  rating === r.value ? r.bg + " ring-2 ring-primary/50" : "border-border bg-background hover:bg-muted"
                } ${rating === r.value ? r.color : "text-muted-foreground"}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <Button onClick={addRevision} disabled={saving} className="w-fit mt-2 bg-gradient-to-r from-cyan-500 to-lime-500 text-black">
            {saving ? "Processing..." : "Submit Review"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Target, label: "Total Topics", value: stats.total, color: "from-cyan-500 to-blue-500" },
          { icon: Clock3, label: "Due Now", value: stats.dueRevisions, color: "from-orange-500 to-red-500" },
          { icon: CheckCircle2, label: "Retention Rate", value: `${stats.completionRate}%`, color: "from-lime-500 to-emerald-500" },
          { icon: TrendingUp, label: "Subjects", value: stats.subjects, color: "from-fuchsia-500 to-cyan-500" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card relative overflow-hidden rounded-2xl border border-border/50 p-4">
            <div className={`inline-flex rounded-lg bg-gradient-to-br p-2 ${stat.color}`}>
              <stat.icon className="h-4 w-4 text-white" />
            </div>
            <p className="mt-2 text-2xl font-black">{stat.value}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-cyan-300" />
          <h2 className="text-lg font-bold">Scheduled Revisions</h2>
        </div>

        {revisions.length === 0 ? (
          <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">No revisions scheduled yet.</div>
        ) : (
          revisions.map((item) => {
            const isDue = new Date(item.nextRevisionAt) <= new Date();
            
            return (
              <motion.div
                key={item._id}
                whileHover={{ y: -2 }}
                className={`flex items-center gap-4 rounded-2xl border p-4 ${
                  isDue 
                    ? "border-orange-500/30 bg-orange-500/5" 
                    : "border-border/50 bg-muted/20"
                }`}
              >
                {isDue ? <Clock3 className="h-5 w-5 text-orange-400 animate-pulse" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.topic}</p>
                  <p className={`text-xs ${isDue ? "text-orange-400 font-medium" : "text-muted-foreground"}`}>
                    {isDue ? "Due Now for Review!" : `Next Review: ${new Date(item.nextRevisionAt).toLocaleString()}`}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setTopic(item.topic);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={isDue ? "border-orange-500/50 text-orange-400 hover:bg-orange-500/10" : ""}
                >
                  Review
                </Button>
              </motion.div>
            );
          })
        )}
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 to-lime-500/10 p-6 text-center">
        <motion.div
          className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-lime-500 text-black"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.8 }}
        >
          <Sparkles className="h-5 w-5" />
        </motion.div>
        <p className="mt-2 text-lg font-bold">Keep the revision chain alive</p>
        <p className="text-sm text-muted-foreground">Your revision cards are now fully database-driven.</p>
      </motion.div>
    </motion.div>
  );
}

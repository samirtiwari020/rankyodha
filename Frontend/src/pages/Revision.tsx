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

type RevisionItem = {
  _id: string;
  topic: string;
  confidence: number;
  nextRevisionAt: string;
};

export default function Revision() {
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [topic, setTopic] = useState("");
  const [confidence, setConfidence] = useState(3);
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
          body: JSON.stringify({ topic: topic.trim(), confidence }),
        },
        true
      );
      setTopic("");
      setConfidence(3);
      await loadRevisions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add revision");
    } finally {
      setSaving(false);
    }
  };

  const toggleDone = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const stats = useMemo(() => {
    const total = revisions.length;
    const done = revisions.filter((r) => completed[r._id]).length;
    const pending = total - done;
    const subjects = new Set(revisions.map((r) => r.topic.split("-")[0].trim())).size;
    const completionRate = total ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, subjects, completionRate };
  }, [revisions, completed]);

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
        <h3 className="text-sm font-semibold">Add Revision Topic</h3>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Thermodynamics - 2nd Law" />
          <select
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <option key={v} value={v}>Confidence {v}</option>
            ))}
          </select>
          <Button onClick={addRevision} disabled={saving} className="bg-gradient-to-r from-cyan-500 to-lime-500 text-black">
            {saving ? "Adding..." : "Add"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Target, label: "Total", value: stats.total, color: "from-cyan-500 to-blue-500" },
          { icon: CheckCircle2, label: "Completed", value: stats.done, color: "from-lime-500 to-emerald-500" },
          { icon: Clock3, label: "Pending", value: stats.pending, color: "from-amber-500 to-orange-500" },
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
          revisions.map((item) => (
            <motion.div
              key={item._id}
              whileHover={{ y: -2 }}
              className={`flex items-center gap-4 rounded-2xl border p-4 ${completed[item._id] ? "border-lime-500/35 bg-lime-500/10" : "border-border/50 bg-muted/20"}`}
              onClick={() => toggleDone(item._id)}
            >
              {completed[item._id] ? <CheckCircle2 className="h-5 w-5 text-lime-300" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
              <div className="flex-1">
                <p className={`text-sm font-semibold ${completed[item._id] ? "line-through text-lime-200/80" : ""}`}>{item.topic}</p>
                <p className="text-xs text-muted-foreground">Due: {new Date(item.nextRevisionAt).toLocaleString()} · Confidence {item.confidence}</p>
              </div>
            </motion.div>
          ))
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

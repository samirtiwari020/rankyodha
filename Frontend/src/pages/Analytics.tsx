import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Clock3, Flame, Target, TrendingUp, Zap } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { apiRequest } from "@/lib/api";

type AnalyticsData = {
  practiceCount: number;
  correctCount: number;
  accuracy: number;
  upcomingRevisions: number;
  notesCount: number;
};

type RevisionData = {
  _id: string;
  topic: string;
  nextRevisionAt: string;
  confidence: number;
};

type GamificationData = {
  user?: {
    points?: number;
  };
  achievements?: { _id: string; title: string }[];
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [revisions, setRevisions] = useState<RevisionData[]>([]);
  const [gami, setGami] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [a, r, g] = await Promise.all([
          apiRequest<AnalyticsData>("/api/v1/analytics", { method: "GET" }, true),
          apiRequest<RevisionData[]>("/api/v1/revision", { method: "GET" }, true),
          apiRequest<GamificationData>("/api/v1/gamification", { method: "GET" }, true),
        ]);

        setAnalytics(a);
        setRevisions(Array.isArray(r) ? r : []);
        setGami(g);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const weeklyRevisionTrend = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 10 }).map((_, idx) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (9 - idx));
      const key = day.toDateString();
      const count = revisions.filter((item) => new Date(item.nextRevisionAt).toDateString() === key).length;
      return {
        date: `${day.getMonth() + 1}/${day.getDate()}`,
        count,
      };
    });
  }, [revisions]);

  const topicDistribution = useMemo(() => {
    const map = revisions.reduce<Record<string, number>>((acc, item) => {
      const label = item.topic.split("-")[0].trim() || "General";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(map)
      .map(([subject, total]) => ({ subject, total }))
      .slice(0, 6);
  }, [revisions]);

  const timeDistribution = useMemo(() => {
    const practice = analytics?.practiceCount ?? 0;
    const revision = analytics?.upcomingRevisions ?? 0;
    const notes = analytics?.notesCount ?? 0;
    const total = Math.max(1, practice + revision + notes);

    return [
      { name: "Practice", value: Math.round((practice / total) * 100), color: "#06b6d4" },
      { name: "Revision", value: Math.round((revision / total) * 100), color: "#84cc16" },
      { name: "Notes", value: Math.round((notes / total) * 100), color: "#22c55e" },
    ];
  }, [analytics]);

  const insights = useMemo(() => {
    const accuracy = analytics?.accuracy ?? 0;
    const upcoming = analytics?.upcomingRevisions ?? 0;
    const notes = analytics?.notesCount ?? 0;

    const first = accuracy >= 70
      ? `Great consistency: accuracy is ${accuracy}%.`
      : `Accuracy is ${accuracy}%. Add more practice to improve.`;

    const second = upcoming > 0
      ? `${upcoming} revisions are due this week.`
      : "No revisions due this week.";

    const third = notes > 0
      ? `You have ${notes} notes saved for quick recap.`
      : "No notes found yet; add notes for better retention.";

    return [first, second, third];
  }, [analytics]);

  if (loading) {
    return <div className="mx-auto max-w-6xl">Loading analytics...</div>;
  }

  if (error) {
    return <div className="mx-auto max-w-6xl text-red-400">{error}</div>;
  }

  const points = gami?.user?.points ?? 0;
  const level = Math.max(1, Math.floor(points / 500) + 1);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-10">
      <motion.div variants={fadeUp} className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-lime-500/10 p-6 md:p-8">
        <h1 className="text-3xl font-black">Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">All values are loaded from backend analytics, revision, and gamification APIs.</p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3">
            <p className="text-[11px] uppercase text-cyan-300">Practice</p>
            <p className="text-xl font-black">{analytics?.practiceCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-lime-500/30 bg-lime-500/10 p-3">
            <p className="text-[11px] uppercase text-lime-300">Accuracy</p>
            <p className="text-xl font-black">{analytics?.accuracy ?? 0}%</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
            <p className="text-[11px] uppercase text-emerald-300">Revisions</p>
            <p className="text-xl font-black">{analytics?.upcomingRevisions ?? 0}</p>
          </div>
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3">
            <p className="text-[11px] uppercase text-orange-300">XP</p>
            <p className="text-xl font-black">{points}</p>
          </div>
          <div className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-3">
            <p className="text-[11px] uppercase text-fuchsia-300">Level</p>
            <p className="text-xl font-black">{level}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-border/50 p-5">
          <h3 className="text-sm font-semibold mb-4 inline-flex items-center gap-2"><TrendingUp className="h-4 w-4 text-cyan-400" /> Revision Trend (10 days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyRevisionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.45} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} dot={{ r: 3, fill: "#84cc16" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-border/50 p-5">
          <h3 className="text-sm font-semibold mb-4 inline-flex items-center gap-2"><Target className="h-4 w-4 text-lime-400" /> Topic Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.45} />
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#84cc16" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-border/50 p-5">
          <h3 className="text-sm font-semibold mb-4 inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-cyan-400" /> Activity Mix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip formatter={(v: number) => [`${v}%`, "Share"]} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Pie data={timeDistribution} cx="50%" cy="50%" innerRadius={62} outerRadius={90} dataKey="value">
                  {timeDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-border/50 p-5">
          <h3 className="text-sm font-semibold mb-4 inline-flex items-center gap-2"><Flame className="h-4 w-4 text-orange-400" /> Smart Insights</h3>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight} className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm">
                {insight}
              </div>
            ))}
            <div className="rounded-xl border border-lime-500/30 bg-lime-500/10 p-3 text-xs text-lime-300 inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" /> Live data only — no dummy metrics
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

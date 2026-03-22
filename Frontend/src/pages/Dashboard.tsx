import { motion, type Variants } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Flame,
  MessageCircleQuestion,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { apiRequest } from "@/lib/api";

type AnalyticsData = {
  practiceCount: number;
  correctCount: number;
  accuracy: number;
  upcomingRevisions: number;
  notesCount: number;
};

type UserData = {
  name?: string;
  points?: number;
};

type GamificationData = {
  user?: UserData;
};

type RevisionData = {
  _id: string;
  topic: string;
  nextRevisionAt: string;
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function ProgressArc({ progress }: { progress: number }) {
  const radius = 48;
  const stroke = 7;
  const normalized = radius - stroke;
  const circumference = normalized * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={radius * 2} height={radius * 2} className="-rotate-90">
      <circle cx={radius} cy={radius} r={normalized} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="transparent" />
      <motion.circle
        cx={radius}
        cy={radius}
        r={normalized}
        stroke="url(#dashboardArc)"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="transparent"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="dashboardArc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#84cc16" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [gami, setGami] = useState<GamificationData | null>(null);
  const [revisions, setRevisions] = useState<RevisionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [analyticsRes, gamiRes, revisionRes] = await Promise.all([
          apiRequest<AnalyticsData>("/api/v1/analytics", { method: "GET" }, true),
          apiRequest<GamificationData>("/api/v1/gamification", { method: "GET" }, true),
          apiRequest<RevisionData[]>("/api/v1/revision", { method: "GET" }, true),
        ]);

        setAnalytics(analyticsRes);
        setGami(gamiRes);
        setRevisions(Array.isArray(revisionRes) ? revisionRes : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const todayTasks = useMemo(() => {
    const now = new Date();
    return revisions
      .filter((item) => {
        const next = new Date(item.nextRevisionAt);
        const diffMs = next.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
        return diffDays <= 1;
      })
      .slice(0, 5);
  }, [revisions]);

  const weeklyTrack = useMemo(() => {
    const today = new Date();
    const labels = ["M", "T", "W", "T", "F", "S", "S"];

    return Array.from({ length: 7 }).map((_, idx) => {
      const day = new Date(today);
      day.setDate(today.getDate() - (6 - idx));
      const dayKey = day.toDateString();
      const count = revisions.filter((r) => new Date(r.nextRevisionAt).toDateString() === dayKey).length;
      return { label: labels[idx], value: Math.min(100, count * 20) };
    });
  }, [revisions]);

  const completedCount = 0;
  const taskProgress = todayTasks.length ? Math.round((completedCount / todayTasks.length) * 100) : 0;

  if (loading) {
    return <div className="mx-auto max-w-7xl">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="mx-auto max-w-7xl text-red-400">{error}</div>;
  }

  const points = gami?.user?.points ?? 0;
  const accuracy = analytics?.accuracy ?? 0;
  const practiceCount = analytics?.practiceCount ?? 0;
  const upcomingRevisions = analytics?.upcomingRevisions ?? 0;
  const notesCount = analytics?.notesCount ?? 0;

  const kpis = [
    { label: "Total XP", value: points.toLocaleString(), icon: Zap, tone: "from-cyan-500 to-blue-500" },
    { label: "Accuracy", value: `${accuracy}%`, icon: Target, tone: "from-green-500 to-lime-500" },
    { label: "Practice", value: String(practiceCount), icon: TrendingUp, tone: "from-emerald-500 to-teal-500" },
    { label: "Notes", value: String(notesCount), icon: Flame, tone: "from-lime-500 to-green-500" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6">
      <motion.section variants={fadeUp} className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-background to-lime-950/20 p-6 md:p-8">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-lime-500/15 blur-3xl" />

        <div className="relative z-10 grid gap-6 md:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" /> Dashboard Command Center
            </p>
            <h1 className="text-3xl font-black md:text-5xl leading-[1.08]">
              Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">{gami?.user?.name || "Learner"}</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              Live performance from your backend data: practice accuracy, revisions due, and progress metrics.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/practice">
                <Button className="gap-2 bg-gradient-to-r from-cyan-500 to-lime-500 font-semibold text-black hover:opacity-95">
                  <Play className="h-4 w-4" /> Start Focus Session
                </Button>
              </Link>
              <Link to="/ai-solver">
                <Button variant="outline" className="gap-2">
                  <MessageCircleQuestion className="h-4 w-4" /> Ask AI Tutor
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 bg-background/60 p-5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Today Revision Completion</p>
              <span className="rounded-md bg-lime-500/10 px-2 py-1 text-xs font-semibold text-lime-300">{taskProgress}%</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24">
                <ProgressArc progress={taskProgress} />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{taskProgress}%</span>
              </div>
              <div className="space-y-2 text-xs">
                <p className="text-muted-foreground">Revisions due today/tomorrow</p>
                <p className="text-2xl font-black">{todayTasks.length}</p>
                <p className="text-cyan-300">Upcoming this week: {upcomingRevisions}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((item) => (
          <div key={item.label} className="glass-card relative overflow-hidden rounded-2xl border border-border/50 p-4">
            <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${item.tone} opacity-20 blur-2xl`} />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-black">{item.value}</p>
              </div>
              <div className={`rounded-xl bg-gradient-to-br p-2 ${item.tone}`}>
                <item.icon className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-border/50 p-5">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-cyan-400" /> Revision Load (Last 7 days)
            </h3>
            <span className="text-xs text-muted-foreground">From schedule</span>
          </div>
          <div className="grid grid-cols-7 items-end gap-3 h-52">
            {weeklyTrack.map((point, i) => (
              <div key={`${point.label}-${i}`} className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{point.value}%</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${point.value}%` }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                  className="w-full rounded-xl bg-gradient-to-t from-cyan-500 via-emerald-500 to-lime-500 shadow-lg shadow-cyan-500/15"
                />
                <span className="text-[10px] font-medium text-muted-foreground">{point.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-border/50 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <CalendarCheck className="h-4 w-4 text-lime-400" /> Upcoming Revisions
            </h3>
            <Link to="/revision" className="text-xs text-cyan-300 hover:underline inline-flex items-center gap-1">
              open <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm text-muted-foreground">
                No revisions due today.
              </div>
            ) : (
              todayTasks.map((item) => (
                <div key={item._id} className="rounded-xl border border-border/50 bg-muted/20 p-3">
                  <p className="text-sm font-semibold">{item.topic}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Due: {new Date(item.nextRevisionAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </section>

      <motion.div variants={fadeUp} className="rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 to-lime-500/10 p-5">
        <p className="text-sm font-semibold">Quick Snapshot</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Correct answers: {analytics?.correctCount ?? 0} of {practiceCount}. Keep your streak with one practice and one revision today.
        </p>
        <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-lime-500/30 bg-lime-500/15 px-3 py-1 text-xs font-bold text-lime-300">
          <CheckCircle2 className="h-3 w-3" /> Data source: backend + database
        </div>
      </motion.div>
    </motion.div>
  );
}

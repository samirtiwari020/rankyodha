import { motion, type Variants } from "framer-motion";
import {
  Activity,
  Award,
  Brain,
  Clock3,
  Flame,
  Gem,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
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
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { format, subDays } from "date-fns";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { apiRequest } from "@/lib/api";
import { RetentionGraph } from "@/components/RetentionGraph";

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

type Trend = "up" | "down";

type MetricCardProps = {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  trend: Trend;
  trendText: string;
  tone: string;
};

type ChartCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0 } },
};

const weeklyPerformance = [
  { date: "Mar 01", score: 66 },
  { date: "Mar 03", score: 70 },
  { date: "Mar 05", score: 68 },
  { date: "Mar 07", score: 74 },
  { date: "Mar 09", score: 77 },
  { date: "Mar 11", score: 81 },
  { date: "Mar 13", score: 79 },
  { date: "Mar 15", score: 83 },
  { date: "Mar 17", score: 86 },
  { date: "Mar 19", score: 89 },
];

const subjectPerformance = [
  { subject: "Physics", accuracy: 84 },
  { subject: "Chemistry", accuracy: 71 },
  { subject: "Math", accuracy: 91 },
];

const timeDistribution = [
  { name: "Practice", value: 52, color: "#06b6d4" },
  { name: "Revision", value: 30, color: "#84cc16" },
  { name: "Tests", value: 18, color: "#22c55e" },
];

const metricCards: MetricCardProps[] = [
  {
    title: "Total Questions Solved",
    value: "1,284",
    icon: Target,
    trend: "up",
    trendText: "+13% this month",
    tone: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/35",
  },
  {
    title: "Accuracy",
    value: "87.4%",
    icon: ShieldCheck,
    trend: "up",
    trendText: "+2.1% this week",
    tone: "from-lime-500/20 to-lime-500/5 border-lime-500/35",
  },
  {
    title: "Tests Attempted",
    value: "42",
    icon: GraduationCap,
    trend: "up",
    trendText: "+4 this week",
    tone: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/35",
  },
  {
    title: "Study Time (Hours)",
    value: "168h",
    icon: Clock3,
    trend: "up",
    trendText: "+9h this week",
    tone: "from-cyan-500/20 to-lime-500/5 border-cyan-500/35",
  },
  {
    title: "Current Streak",
    value: "18 days",
    icon: Flame,
    trend: "down",
    trendText: "-1 day from peak",
    tone: "from-orange-500/20 to-red-500/5 border-orange-500/35",
  },
  {
    title: "Avg Test Score",
    value: "88/100",
    icon: Trophy,
    trend: "up",
    trendText: "+6 points",
    tone: "from-fuchsia-500/20 to-cyan-500/5 border-fuchsia-500/35",
  },
];

const insights = [
  "You are strong in Mathematics with consistent 90%+ outcomes.",
  "Focus more on Organic Chemistry to unlock faster score gains.",
  "Your accuracy dipped in the last 7 days after long sessions.",
  "Short revision sprints before tests can improve retention by 12%.",
];

function MetricCard({ title, value, icon: Icon, trend, trendText, tone }: MetricCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300 ${tone}`}
    >
      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/10 opacity-20 blur-2xl transition-opacity group-hover:opacity-40" />
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="rounded-lg bg-black/20 p-2">
            <Icon className="h-4 w-4 text-cyan-200" />
          </div>
        </div>
        <p className="text-2xl font-black">{value}</p>
        <div className="flex items-center gap-1 text-xs font-semibold">
          {trend === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-lime-400" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-orange-400" />
          )}
          <span className={trend === "up" ? "text-lime-300" : "text-orange-300"}>{trendText}</span>
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-border/50 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold tracking-wide">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

type HeatmapCardProps = {
  values: { date: string; count: number }[];
  selectedRange: "90d" | "180d" | "365d";
  onRangeChange: (range: "90d" | "180d" | "365d") => void;
  totalSubmissions: number;
  activeDays: number;
  maxStreak: number;
};

function HeatmapCard({
  values,
  selectedRange,
  onRangeChange,
  totalSubmissions,
  activeDays,
  maxStreak,
}: HeatmapCardProps) {
  return (
    <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1319] p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-6">
          <p className="text-[28px] font-black leading-none text-white sm:text-[36px]">{totalSubmissions}</p>
          <p className="text-base text-slate-300">submissions in the past year</p>
          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <span>
              Total active days: <span className="font-semibold text-white">{activeDays}</span>
            </span>
            <span>
              Max streak: <span className="font-semibold text-white">{maxStreak}</span>
            </span>
          </div>
        </div>

        <div className="inline-flex items-center rounded-lg border border-white/10 bg-[#1f242d] p-1 text-xs font-semibold">
          {(["90d", "180d", "365d"] as const).map((range) => (
            <button
              key={range}
              onClick={() => onRangeChange(range)}
              className={`rounded-md px-3 py-1.5 transition-all ${
                selectedRange === range ? "bg-[#2b313c] text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[1000px]">
          <CalendarHeatmap
            startDate={subDays(new Date(), 365)}
            endDate={new Date()}
            values={values}
            classForValue={(v) => {
              if (!v || v.count === 0) return "heatmap-empty";
              if (v.count <= 3) return "heatmap-low";
              if (v.count <= 7) return "heatmap-medium";
              return "heatmap-high";
            }}
            showWeekdayLabels={false}
            titleForValue={(v) => {
              if (!v) return "No activity";
              return `${v.date}: ${v.count} submissions`;
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
        <span>Less</span>
        <span className="h-3 w-3 rounded-[2px] bg-[#232a34]" />
        <span className="h-3 w-3 rounded-[2px] bg-[#0e4429]" />
        <span className="h-3 w-3 rounded-[2px] bg-[#006d32]" />
        <span className="h-3 w-3 rounded-[2px] bg-[#26a641]" />
        <span className="h-3 w-3 rounded-[2px] bg-[#39d353]" />
        <span>More</span>
      </div>
    </motion.div>
  );
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [revisions, setRevisions] = useState<RevisionData[]>([]);
  const [gami, setGami] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRange, setSelectedRange] = useState<"90d" | "180d" | "365d">("365d");

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

  const dynamicTimeDistribution = useMemo(() => {
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

  const dynamicInsights = useMemo(() => {
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

  const xpCurrent = gami?.user?.points ?? 0;
  const level = Math.max(1, Math.floor(xpCurrent / 500) + 1);
  const streakDays = 18; // Mock for now or pull from gami if available
  const xpTarget = level * 500 + 500;
  const xpPercent = Math.round((xpCurrent / xpTarget) * 100);

  const heatmapValues = useMemo(() => {
    // Always generate 365 days, but only populate data for selected range
    const rangeLimit = selectedRange === "90d" ? 90 : selectedRange === "180d" ? 180 : 365;
    
    return Array.from({ length: 365 }).map((_, idx) => {
      const d = subDays(new Date(), 365 - idx);
      const daysFromNow = 365 - idx;
      
      // Only populate data for days within the selected range
      if (daysFromNow <= rangeLimit) {
        const seed = d.getDate() + d.getMonth() * 3 + idx;
        const count = seed % 8 === 0 ? 0 : (seed % 9) + (seed % 4);
        return { date: format(d, "yyyy-MM-dd"), count };
      }
      
      // Empty cells for days outside the range
      return { date: format(d, "yyyy-MM-dd"), count: 0 };
    });
  }, [selectedRange]);

  const heatmapStats = useMemo(() => {
    let active = 0;
    let total = 0;
    let currentStreak = 0;
    let bestStreak = 0;

    heatmapValues.forEach((item) => {
      total += item.count;
      if (item.count > 0) {
        active += 1;
        currentStreak += 1;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });

    return {
      activeDays: active,
      totalSubmissions: total,
      maxStreak: bestStreak,
    };
  }, [heatmapValues]);

  return (
    <>
      <style>{`
        .react-calendar-heatmap text {
          fill: hsl(var(--muted-foreground));
          font-size: 10px;
        }
        .react-calendar-heatmap svg {
          overflow: visible;
        }
        .react-calendar-heatmap g g {
          margin-right: 8px;
        }
        .react-calendar-heatmap g g rect {
          rx: 2.5;
          ry: 2.5;
        }
        .react-calendar-heatmap .color-empty,
        .react-calendar-heatmap .heatmap-empty {
          fill: #232a34;
          stroke: rgba(255, 255, 255, 0.04);
          rx: 2.5;
          ry: 2.5;
        }
        .react-calendar-heatmap .heatmap-low {
          fill: #0e4429;
          rx: 2.5;
          ry: 2.5;
        }
        .react-calendar-heatmap .heatmap-medium {
          fill: #006d32;
          rx: 2.5;
          ry: 2.5;
        }
        .react-calendar-heatmap .heatmap-high {
          fill: #39d353;
          rx: 2.5;
          ry: 2.5;
        }
        .react-calendar-heatmap rect:hover {
          stroke: rgba(255, 255, 255, 0.35);
          stroke-width: 1px;
        }
        .react-calendar-heatmap .react-calendar-heatmap-month-label {
          fill: #94a3b8;
          font-size: 9px;
          font-weight: 500;
        }
        .react-calendar-heatmap .react-calendar-heatmap-weekday-label {
          fill: #94a3b8;
          font-size: 8px;
        }
      `}</style>

      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 pb-10">
        <motion.div
          variants={fadeUp}
          className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/15 via-lime-500/5 to-transparent p-6 md:p-8"
        >
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-500 to-lime-500 opacity-10 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-cyan-500 opacity-5 blur-3xl" />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.8fr_1fr] lg:items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-black md:text-4xl">Your Progress Dashboard 🚀</h1>
              <p className="max-w-2xl text-sm text-foreground/75 md:text-base">
                Track your momentum, review smart insights, and keep your streak alive. Your learning journey now feels like a game.
              </p>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-cyan-300">XP Points</p>
                  <p className="text-xl font-black">{xpCurrent}</p>
                </div>
                <div className="rounded-2xl border border-lime-500/30 bg-lime-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-lime-300">Current Level</p>
                  <p className="text-xl font-black">Level {level}</p>
                </div>
                <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-orange-300">Daily Streak 🔥</p>
                  <p className="text-xl font-black">{streakDays} Days</p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>XP Progress to Level {level + 1}</span>
                  <span>{xpCurrent} / {xpTarget} XP</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-lime-500 to-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl border border-cyan-500/30 p-5">
              <div className="mb-4 flex items-center gap-2 text-cyan-300">
                <Gem className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Gamified Rank</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">League</span>
                  <span className="font-bold text-lime-300">Platinum</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Global Rank</span>
                  <span className="font-bold">#124</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Weekly XP Gain</span>
                  <span className="font-bold text-cyan-300">+420 XP</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <HeatmapCard
          values={heatmapValues}
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
          totalSubmissions={heatmapStats.totalSubmissions}
          activeDays={heatmapStats.activeDays}
          maxStreak={heatmapStats.maxStreak}
        />

        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {metricCards.map((card) => (
            <MetricCard key={card.title} {...card} />
          ))}
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <ChartCard title="Performance Over Time" subtitle="Accuracy trend with smooth progression">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.45} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      formatter={(v: number) => [`${v}%`, "Accuracy"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#06b6d4"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#84cc16" }}
                      activeDot={{ r: 6, fill: "#22c55e" }}
                      isAnimationActive
                      animationDuration={1200}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="xl:col-span-5">
            <ChartCard title="Subject-wise Performance" subtitle="Animated bars by core subjects">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.45} />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      formatter={(v: number) => [`${v}%`, "Accuracy"]}
                    />
                    <Bar dataKey="accuracy" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={1100}>
                      <Cell fill="#06b6d4" />
                      <Cell fill="#84cc16" />
                      <Cell fill="#22c55e" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-5">
            <ChartCard title="Time Distribution" subtitle="Practice vs Revision vs Tests">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      formatter={(v: number) => [`${v}%`, "Time"]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Pie
                      data={timeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={90}
                      dataKey="value"
                      isAnimationActive
                      animationDuration={1000}
                    >
                      {timeDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="xl:col-span-7">
            <motion.div variants={fadeUp} className="glass-card rounded-2xl border border-border/50 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold tracking-wide">Smart Insights 💡</h3>
                <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  AI Coach Mode
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {insights.map((insight, idx) => (
                  <motion.div
                    key={insight}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-lime-500/5 p-4"
                  >
                    <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-lime-300">
                      <Brain className="h-3 w-3" /> Insight {idx + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/85">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <motion.div variants={fadeUp} className="xl:col-span-12">
            <div className="glass-card h-full rounded-2xl border border-lime-500/25 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-wide">Gamification Hub 🎮</h3>
                <div className="rounded-lg bg-lime-500/20 p-1.5">
                  <Award className="h-4 w-4 text-lime-300" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/40 bg-background/50 p-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">XP Track</span>
                    <span className="font-bold text-cyan-300">{xpPercent}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercent}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-lime-500"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-widest text-cyan-300">Level Badge</p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-black/20 px-4 py-1.5">
                    <Zap className="h-4 w-4 text-cyan-300" />
                    <span className="text-sm font-black">Level {level}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Achievements</p>
                  {[
                    { label: "5 Day Streak", icon: Flame, tone: "text-orange-300 border-orange-500/30 bg-orange-500/10" },
                    { label: "50 Questions Solved", icon: Target, tone: "text-lime-300 border-lime-500/30 bg-lime-500/10" },
                    { label: "3 Perfect Tests", icon: Trophy, tone: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10" },
                    { label: "2h Focus Sprint", icon: Timer, tone: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
                  ].map((badge) => (
                    <motion.div
                      key={badge.label}
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 text-sm font-semibold ${badge.tone}`}
                    >
                      <badge.icon className="h-4 w-4" />
                      {badge.label}
                    </motion.div>
                  ))}
                </div>

                <div className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/10 p-3 text-xs text-fuchsia-200">
                  <div className="flex items-center gap-1 font-semibold">
                    <Sparkles className="h-3.5 w-3.5" />
                    Bonus Mission
                  </div>
                  <p className="mt-1 leading-relaxed">Score 90%+ in 2 mock tests this week to unlock 250 XP bonus.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

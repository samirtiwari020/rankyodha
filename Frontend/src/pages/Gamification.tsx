import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Trophy, Flame, Medal, Zap, Crown, Star } from "lucide-react";
import { apiRequest } from "@/lib/api";

const fadeUp: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

type Achievement = {
  _id: string;
  title: string;
  description?: string;
  earnedAt?: string;
};

type GamificationPayload = {
  user?: {
    name?: string;
    points?: number;
  };
  achievements?: Achievement[];
};

export default function Gamification() {
  const [data, setData] = useState<GamificationPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const payload = await apiRequest<GamificationPayload>("/api/v1/gamification", { method: "GET" }, true);
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load gamification");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const xp = data?.user?.points ?? 0;
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const nextLevelXp = level * 500;
  const currentLevelBase = (level - 1) * 500;
  const progressInLevel = xp - currentLevelBase;
  const neededInLevel = Math.max(1, nextLevelXp - currentLevelBase);
  const progressPercent = Math.min(100, Math.round((progressInLevel / neededInLevel) * 100));

  const streakEstimate = useMemo(() => {
    const achievements = data?.achievements ?? [];
    return Math.max(0, achievements.length);
  }, [data?.achievements]);

  if (loading) {
    return <div className="max-w-4xl mx-auto">Loading gamification...</div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto text-red-400">{error}</div>;
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold">Gamification</h1>
        <p className="text-muted-foreground text-sm mt-1">Backend-powered points and achievements</p>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">{level}</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">Level {level}</h3>
            <p className="text-sm text-muted-foreground">{xp} XP total</p>
            <p className="text-xs text-muted-foreground">{Math.max(0, nextLevelXp - xp)} XP to next level</p>
          </div>
        </div>

        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1 text-sm">
            <Flame className="h-4 w-4 text-warning" />
            <span className="font-medium">Achievement streak: {streakEstimate}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-medium">{xp} XP</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="glass-card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Medal className="h-4 w-4 text-primary" /> Achievements
        </h3>

        {(data?.achievements?.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">No achievements unlocked yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data?.achievements?.map((a, idx) => {
              const icons = [Star, Flame, Trophy, Crown];
              const Icon = icons[idx % icons.length];

              return (
                <div key={a._id} className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                  <Icon className="h-6 w-6 mb-2 text-primary" />
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{a.description || "Achievement unlocked"}</p>
                  {a.earnedAt && <p className="text-[10px] text-muted-foreground mt-1">{new Date(a.earnedAt).toLocaleString()}</p>}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

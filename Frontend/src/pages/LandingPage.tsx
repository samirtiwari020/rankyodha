import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Target,
  BarChart3,
  ArrowRight,
  BookOpen,
  Atom,
  Stethoscope,
  Landmark,
  GraduationCap,
  Menu,
  X,
  CalendarCheck,
  MessageCircleQuestion,
  Flame,
  Trophy,
  Crown,
  Medal,
  Star,
  Zap,
  CheckCircle,
  TrendingUp,
  Quote,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import type { Easing } from "framer-motion";

/* ─── Exam Logo Components ─── */
const JEELogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <linearGradient id="jeegradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a3e635" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
    </defs>
    {/* Atom nucleus */}
    <circle cx="50" cy="50" r="8" fill="url(#jeegradient)" />
    {/* Orbits */}
    <ellipse cx="50" cy="50" rx="28" ry="12" fill="none" stroke="url(#jeegradient)" strokeWidth="2" opacity="0.7" />
    <ellipse cx="50" cy="50" rx="12" ry="28" fill="none" stroke="url(#jeegradient)" strokeWidth="2" opacity="0.7" transform="rotate(45 50 50)" />
    {/* Electrons */}
    <circle cx="78" cy="50" r="3" fill="url(#jeegradient)" />
    <circle cx="22" cy="50" r="3" fill="url(#jeegradient)" />
    <circle cx="50" cy="78" r="3" fill="url(#jeegradient)" />
  </svg>
);

const NEETLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <linearGradient id="neetgradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
    </defs>
    {/* Stethoscope */}
    <path d="M 50 20 Q 50 35 37 35 Q 20 35 20 50 Q 20 65 37 65 Q 50 65 50 80" fill="none" stroke="url(#neetgradient)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 50 20 Q 50 35 63 35 Q 80 35 80 50 Q 80 65 63 65 Q 50 65 50 80" fill="none" stroke="url(#neetgradient)" strokeWidth="3" strokeLinecap="round" />
    {/* Membrane circle */}
    <circle cx="50" cy="85" r="6" fill="url(#neetgradient)" />
  </svg>
);

const UPSCLogo = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <linearGradient id="upscgradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="100%" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    {/* Shield */}
    <path d="M 50 15 L 75 28 L 75 55 Q 75 75 50 85 Q 25 75 25 55 L 25 28 Z" fill="url(#upscgradient)" opacity="0.2" stroke="url(#upscgradient)" strokeWidth="2" />
    {/* Seal circles */}
    <circle cx="50" cy="50" r="15" fill="none" stroke="url(#upscgradient)" strokeWidth="2" />
    <circle cx="50" cy="50" r="10" fill="url(#upscgradient)" opacity="0.3" />
    {/* Center dot */}
    <circle cx="50" cy="50" r="4" fill="url(#upscgradient)" />
  </svg>
);


/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as Easing },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const scaleInUp = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.4, ease: "backOut" as Easing },
  }),
};

const slideInFromLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as Easing },
  }),
};

const slideInFromRight = {
  hidden: { opacity: 0, x: 50 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as Easing },
  }),
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as Easing },
  },
};

const rotatingAnimation = {
  animate: {
    rotate: 360,
    transition: { duration: 20, repeat: Infinity, ease: "linear" as Easing },
  },
};

/* ─── Data ─── */
const features = [
  {
    icon: CalendarCheck,
    title: "AI Study Planner",
    desc: "Get a fully personalized study schedule powered by AI that adapts to your pace, goals, and available time.",
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    icon: MessageCircleQuestion,
    title: "Smart Doubt Solver",
    desc: "Instant AI-powered doubt resolution with step-by-step explanations for any concept or problem.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Target,
    title: "Adaptive Practice",
    desc: "Practice questions that dynamically adjust difficulty based on your performance to maximize learning.",
    gradient: "from-lime-500 to-green-600",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    desc: "Deep insights into your progress with predicted scores, weak-area analysis, and improvement trends.",
    gradient: "from-green-500 to-emerald-600",
  },
];

const exams = [
  {
    logo: JEELogo,
    name: "JEE",
    full: "Joint Entrance Examination",
    desc: "Physics, Chemistry & Mathematics preparation with AI-solved problems.",
    color: "from-lime-500 to-green-500",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
  },
  {
    logo: NEETLogo,
    name: "NEET",
    full: "National Eligibility cum Entrance Test",
    desc: "Biology, Physics & Chemistry with visual aids and mnemonics.",
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
  },
  {
    logo: UPSCLogo,
    name: "UPSC",
    full: "Union Public Service Commission",
    desc: "GS, CSAT & Optional subjects with current affairs integration.",
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
];

const testimonials = [
  {
    name: "Arjun Singh",
    exam: "JEE Mains 2024 - Qualified",
    quote: "RankYodha's AI completely changed how I study. In 3 months, I went from 65% to 92% in my mock tests!",
    avatar: "🧑‍🎓",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Priya Sharma",
    exam: "NEET 2024 - 650/720",
    quote: "The doubt solver saved me hours. No more waiting for teachers — answers instantly with explanations.",
    avatar: "👩‍🎓",
    color: "from-lime-500 to-green-500",
  },
  {
    name: "Rahul Kumar",
    exam: "UPSC CSE 2024 - Top 500",
    quote: "The analytics dashboard showed exactly where I was weak. Fixed those gaps and my score jumped 30 points!",
    avatar: "🧑‍💼",
    color: "from-green-500 to-emerald-500",
  },
];

const stats = [
  { label: "Students Learning", value: "10K+", icon: Users },
  { label: "Questions Solved", value: "500K+", icon: CheckCircle },
  { label: "Success Rate", value: "94%", icon: TrendingUp },
];


/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 group"
          >
            <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:inline">
              RankYodha
            </span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#exams" className="hover:text-foreground transition-colors">
              Exams
            </a>
            <a href="#about" className="hover:text-foreground transition-colors">
              About
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/auth")}
              className="text-sm"
            >
              Login
            </Button>
            <Button
              size="sm"
              className="gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow text-sm"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-2"
          >
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#exams"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Exams
            </a>
            <a
              href="#about"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </a>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
              <Button
                size="sm"
                className="flex-1 gradient-primary text-white"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Decorative blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-float" />
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-lime-500/5 blur-[140px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0} className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Exam Preparation
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight"
            >
              Your Personal{" "}
              <span className="gradient-text">RankYodha</span>
              <br />
              <span className="gradient-text">AI Mentor</span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed"
            >
              Experience the future of learning — our AI adapts to your unique
              pace, identifies knowledge gaps, and crafts a personalized roadmap
              to ace <strong className="text-foreground">JEE</strong>,{" "}
              <strong className="text-foreground">NEET</strong>, and{" "}
              <strong className="text-foreground">UPSC</strong>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button
                size="lg"
                className="gradient-primary text-white shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all text-base px-8 gap-2 group"
                onClick={() => navigate("/signup")}
              >
                Get Started
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base px-8 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-background gradient-primary flex items-center justify-center"
                    >
                      <GraduationCap className="h-3.5 w-3.5 text-white" />
                    </div>
                  ))}
                </div>
                <span>
                  <strong className="text-foreground">10,000+</strong> students
                </span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-border" />
              <span>
                Trusted by toppers across India
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 right-0 w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-lime-500/5 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3"
            >
              Why RankYodha?
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold"
            >
              Everything you need to{" "}
              <span className="gradient-text">ace your exams</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={scaleInUp}
                custom={i}
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="glass-card-hover p-8 rounded-2xl group cursor-default border border-border/40 bg-gradient-to-br from-background to-background/50 hover:border-primary/20 transition-all duration-300"
              >
                {/* Floating background accent */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10">
                  <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${f.gradient} opacity-5 blur-2xl group-hover:opacity-15 transition-opacity`} />
                </div>

                <motion.div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-lg`}
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <f.icon className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Exams Section ── */}
      <section
        id="exams"
        className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background relative"
      >
        {/* Animated grid background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-green-500/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3"
            >
              Supported Exams
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold"
            >
              Prepare for India's{" "}
              <span className="gradient-text">top exams</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {exams.map((e, i) => (
              <motion.div
                key={e.name}
                variants={slideInFromLeft}
                custom={i}
                whileHover={{ y: -10, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
                className={`glass-card-hover p-8 rounded-2xl border ${e.border} bg-gradient-to-br from-background/60 to-background/30 hover:border-primary/30 transition-all duration-300 group relative overflow-hidden`}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10">
                  <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${e.color} opacity-5 blur-2xl`} />
                </div>

                <motion.div
                  className={`h-20 w-20 rounded-2xl ${e.bg} flex items-center justify-center mb-6 border ${e.border}`}
                  whileHover={{ rotate: 10, scale: 1.12 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-12 h-12">
                    <e.logo />
                  </div>
                </motion.div>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-xl font-bold">{e.name}</h3>
                  <span className="text-xs text-muted-foreground">{e.full}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {e.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={staggerContainer}
            className="grid sm:grid-cols-3 gap-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={scaleInUp}
                custom={i}
                className="text-center"
              >
                <motion.div
                  className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <stat.icon className="h-7 w-7 text-white" />
                </motion.div>
                <motion.div
                  className="text-3xl md:text-4xl font-bold gradient-text"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.3 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Gamification Section ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-lime-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-green-500/5 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3"
            >
              Stay Motivated
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold"
            >
              Learning feels like a{" "}
              <span className="gradient-text">game</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="max-w-2xl mx-auto text-muted-foreground mt-4 text-base sm:text-lg"
            >
              Earn rewards, climb leaderboards, and unlock achievements as you
              study — because consistency deserves celebration.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Daily Streaks */}
            <motion.div
              variants={scaleInUp}
              custom={0}
              whileHover={{ y: -8 }}
              className="glass-card-hover rounded-2xl p-6 group cursor-default relative overflow-hidden border border-border/40 bg-gradient-to-br from-background/60 to-background/30"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-green-500/10 blur-2xl group-hover:bg-green-500/20 transition-colors" />
              <div className="relative z-10">
                <motion.div
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg"
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Flame className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-1">Daily Streaks</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build consistency with daily study streaks and never break the chain.
                </p>
                {/* Mock streak counter */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                    <motion.div
                      key={day}
                      whileHover={{ scale: 1.15 }}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        day <= 5
                          ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md shadow-green-500/25"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {day <= 5 ? <Flame className="h-3.5 w-3.5" /> : day}
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong className="text-green-500">5 day</strong> streak 🔥
                </p>
              </div>
            </motion.div>

            {/* XP Points */}
            <motion.div
              variants={scaleInUp}
              custom={1}
              whileHover={{ y: -8 }}
              className="glass-card-hover rounded-2xl p-6 group cursor-default relative overflow-hidden border border-border/40 bg-gradient-to-br from-background/60 to-background/30"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-lime-500/10 blur-2xl group-hover:bg-lime-500/20 transition-colors" />
              <div className="relative z-10">
                <motion.div
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center mb-4 shadow-lg"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Zap className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-1">XP Points</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Earn XP for every question solved, chapter completed, and milestone hit.
                </p>
                {/* Mock XP bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-lime-500">Level 12</span>
                    <span className="text-muted-foreground">2,450 / 3,000 XP</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden border border-border/50">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-lime-500 to-green-500"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "82%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-lime-500">550 XP</strong> to next level ⚡
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              variants={scaleInUp}
              custom={2}
              whileHover={{ y: -8 }}
              className="glass-card-hover rounded-2xl p-6 group cursor-default relative overflow-hidden border border-border/40 bg-gradient-to-br from-background/60 to-background/30"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-colors" />
              <div className="relative z-10">
                <motion.div
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg"
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Trophy className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-1">Leaderboard</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Compete with peers and climb the ranks on weekly leaderboards.
                </p>
                {/* Mini leaderboard */}
                <div className="space-y-1.5">
                  {[
                    { rank: 1, name: "Arjun S.", xp: "4,820", icon: Crown, color: "text-lime-500" },
                    { rank: 2, name: "Priya M.", xp: "4,510", icon: Medal, color: "text-slate-400" },
                    { rank: 3, name: "Rahul K.", xp: "4,290", icon: Medal, color: "text-green-600" },
                  ].map((r) => (
                    <motion.div
                      key={r.rank}
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg transition-all ${
                        r.rank === 1 ? "bg-lime-500/10 border border-lime-500/20" : "bg-muted/50"
                      }`}
                    >
                      <r.icon className={`h-3.5 w-3.5 ${r.color}`} />
                      <span className="font-semibold flex-1">{r.name}</span>
                      <span className="text-muted-foreground">{r.xp} XP</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              variants={scaleInUp}
              custom={3}
              whileHover={{ y: -8 }}
              className="glass-card-hover rounded-2xl p-6 group cursor-default relative overflow-hidden border border-border/40 bg-gradient-to-br from-background/60 to-background/30"
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-green-500/10 blur-2xl group-hover:bg-green-500/20 transition-colors" />
              <div className="relative z-10">
                <motion.div
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Star className="h-6 w-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold mb-1">Achievements</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlock badges for milestones — from first solve to 100-day streaks.
                </p>
                {/* Badge grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { emoji: "🚀", label: "First Solve", unlocked: true },
                    { emoji: "🔥", label: "7-Day Streak", unlocked: true },
                    { emoji: "🧠", label: "100 Questions", unlocked: true },
                    { emoji: "⭐", label: "Top 10", unlocked: true },
                    { emoji: "💎", label: "Diamond", unlocked: false },
                    { emoji: "🏆", label: "Champion", unlocked: false },
                    { emoji: "👑", label: "Legend", unlocked: false },
                    { emoji: "🎯", label: "Perfect", unlocked: false },
                  ].map((b) => (
                    <motion.div
                      key={b.label}
                      title={b.label}
                      whileHover={{ scale: b.unlocked ? 1.2 : 1, rotate: b.unlocked ? 10 : 0 }}
                      className={`h-10 w-full rounded-lg flex items-center justify-center text-base transition-all ${
                        b.unlocked
                          ? "bg-emerald-500/10 border border-emerald-500/20 shadow-sm hover:shadow-md"
                          : "bg-muted/50 opacity-40 grayscale"
                      }`}
                    >
                      {b.emoji}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials Section ── */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-14"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3"
            >
              Success Stories
            </motion.span>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl sm:text-4xl font-bold"
            >
              Hear from our <span className="gradient-text">top students</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={slideInFromRight}
                custom={i}
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                className="glass-card-hover rounded-2xl p-8 border border-border/40 bg-gradient-to-br from-background/60 to-background/30 group relative overflow-hidden"
              >
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${t.color} opacity-5 blur-2xl`} />
                </div>

                <div className="relative z-10">
                  {/* Quote icon */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center mb-4 shadow-md`}
                  >
                    <Quote className="h-5 w-5 text-white" />
                  </motion.div>

                  {/* Testimonial */}
                  <p className="text-sm leading-relaxed mb-6 italic text-muted-foreground">
                    "{t.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-base shadow-md`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.exam}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* ── CTA Banner ── */}
      <section id="about" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto gradient-primary rounded-3xl p-10 md:p-20 text-center text-white relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.08),transparent_50%)]" />

          {/* Floating sparkle dots */}
          <div className="absolute top-8 left-12 w-2 h-2 rounded-full bg-white/30 animate-pulse-soft" />
          <div className="absolute top-20 right-16 w-1.5 h-1.5 rounded-full bg-white/20 animate-float" />
          <div className="absolute bottom-12 left-1/4 w-1 h-1 rounded-full bg-white/25 animate-float-delayed" />
          <div className="absolute bottom-20 right-1/3 w-2.5 h-2.5 rounded-full bg-white/15 animate-pulse-soft" />
          <div className="absolute top-1/3 left-8 w-1.5 h-1.5 rounded-full bg-white/20 animate-float-delayed" />

          {/* Pulsing ring */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border border-white/10 animate-pulse-soft" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[350px] md:h-[350px] rounded-full border border-white/5 animate-pulse-soft" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/15 border border-white/20 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Free to Get Started
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Start Your Smart Learning
              <br />
              Journey Today
            </h2>

            <p className="max-w-xl mx-auto text-white/75 text-base sm:text-lg leading-relaxed">
              Join 10,000+ students who are already using AI to study smarter,
              score higher, and achieve their dream results.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/15 text-base px-10 py-6 gap-2 group font-bold"
                onClick={() => navigate("/signup")}
              >
                Sign Up Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <span className="text-white/50 text-sm">No credit card required</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md gradient-primary flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-foreground">RankYodha</span>
          </div>
          <p>&copy; {new Date().getFullYear()} RankYodha. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

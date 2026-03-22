import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Target,
  BarChart3,
  ArrowRight,
  BookOpen,
  Menu,
  X,
  CalendarCheck,
  MessageCircleQuestion,
  Flame,
  Trophy,
  Star,
  Zap,
  CheckCircle,
  TrendingUp,
  Quote,
  Users,
  Rocket,
  Shield,
  Lightbulb,
  Clock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ParticleBackground";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
    <circle cx="50" cy="50" r="8" fill="url(#jeegradient)" />
    <ellipse cx="50" cy="50" rx="28" ry="12" fill="none" stroke="url(#jeegradient)" strokeWidth="2" opacity="0.7" />
    <ellipse cx="50" cy="50" rx="12" ry="28" fill="none" stroke="url(#jeegradient)" strokeWidth="2" opacity="0.7" transform="rotate(45 50 50)" />
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
    <path d="M 50 20 Q 50 35 37 35 Q 20 35 20 50 Q 20 65 37 65 Q 50 65 50 80" fill="none" stroke="url(#neetgradient)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 50 20 Q 50 35 63 35 Q 80 35 80 50 Q 80 65 63 65 Q 50 65 50 80" fill="none" stroke="url(#neetgradient)" strokeWidth="3" strokeLinecap="round" />
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
    <path d="M 50 15 L 75 28 L 75 55 Q 75 75 50 85 Q 25 75 25 55 L 25 28 Z" fill="url(#upscgradient)" opacity="0.2" stroke="url(#upscgradient)" strokeWidth="2" />
    <circle cx="50" cy="50" r="15" fill="none" stroke="url(#upscgradient)" strokeWidth="2" />
    <circle cx="50" cy="50" r="10" fill="url(#upscgradient)" opacity="0.3" />
    <circle cx="50" cy="50" r="4" fill="url(#upscgradient)" />
  </svg>
);

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as Easing } },
};

const heroTextVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: "easeOut" as Easing },
  }),
};

/* ─── Data ─── */
const features = [
  {
    icon: Brain,
    title: "Smart AI Tutor",
    desc: "Gets smarter as you learn, adapting to your pace and style",
    number: "01",
    color: "from-cyan-500 to-blue-500",
  },
  {
    icon: Zap,
    title: "Instant Doubt Solve",
    desc: "Ask anything, get answers with step-by-step explanations",
    number: "02",
    color: "from-lime-500 to-green-500",
  },
  {
    icon: TrendingUp,
    title: "Real-time Progress",
    desc: "Watch your improvement with detailed analytics & insights",
    number: "03",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Trophy,
    title: "Gamified Learning",
    desc: "Earn streaks, unlock badges, and compete on leaderboards",
    number: "04",
    color: "from-cyan-500 to-teal-500",
  },
];

const exams = [
  {
    logo: JEELogo,
    name: "JEE",
    full: "Joint Entrance Examination",
    desc: "Physics, Chemistry & Mathematics",
    topics: "2,500+ questions",
    color: "from-lime-500 to-green-500",
    bg: "bg-lime-500/10",
    border: "border-lime-500/20",
    icon: Rocket,
  },
  {
    logo: NEETLogo,
    name: "NEET",
    full: "National Eligibility cum Entrance Test",
    desc: "Biology, Physics & Chemistry",
    topics: "3,200+ questions",
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    icon: Shield,
  },
  {
    logo: UPSCLogo,
    name: "UPSC",
    full: "Union Public Service Commission",
    desc: "GS, CSAT & Optional subjects",
    topics: "4,800+ questions",
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    icon: Award,
  },
];

const benefits = [
  { icon: Clock, title: "Learn at Your Pace", desc: "Study whenever and however you want" },
  { icon: Lightbulb, title: "Concept Clarity", desc: "Master fundamentals with interactive lessons" },
  { icon: CheckCircle, title: "100% Success", desc: "Proven methods used by top rankers" },
  { icon: Users, title: "Community Support", desc: "Learn with 10,000+ students online" },
];

const testimonials = [
  {
    name: "Arjun Singh",
    exam: "JEE 2024 - 99.9 Percentile",
    quote: "RankYodha's AI completely changed my study approach. My mock score went from 65% to 92% in just 3 months!",
    avatar: "🧑‍🎓",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "Priya Sharma",
    exam: "NEET 2024 - 650/720",
    quote: "The doubt solver is a game-changer. No more waiting for teachers — instant answers with crystal-clear explanations!",
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

export default function LandingPageNew() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <ParticleBackground />
      <div className="relative z-10">
      {/* ══════════════════════════════════════════════════════════════════
          NAVBAR
          ══════════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-all">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent hidden sm:inline">RankYodha</span>
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#exams" className="hover:text-foreground transition-colors">Exams</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-sm">Login</Button>
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-lime-500 text-black hover:shadow-lg hover:shadow-cyan-500/50 transition-all font-semibold" onClick={() => navigate("/signup")}>
              Start Free
            </Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur px-4 py-3 space-y-2">
            <a href="#features" className="block py-2 text-sm hover:text-cyan-400 transition-colors">Features</a>
            <a href="#exams" className="block py-2 text-sm hover:text-cyan-400 transition-colors">Exams</a>
            <a href="#testimonials" className="block py-2 text-sm hover:text-cyan-400 transition-colors">Reviews</a>
            <div className="flex gap-2 pt-3">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate("/auth")}>Login</Button>
              <Button size="sm" className="flex-1 bg-gradient-to-r from-cyan-500 to-lime-500 text-black" onClick={() => navigate("/signup")}>Start Free</Button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION - REDESIGNED
          ══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-40 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="text-center space-y-6">
            {/* Smart badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-lime-500/10 border border-cyan-500/30 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">AI-Powered Learning Platform</span>
            </motion.div>

            {/* Main heading with animated text */}
            <motion.div variants={itemVariants} className="space-y-3">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.12]">
                <span className="block">Study Smarter.</span>
                <span className="block pb-2 bg-gradient-to-r from-cyan-400 via-lime-400 to-green-400 bg-clip-text text-transparent">Score Higher.</span>
                <span className="block">Stay Unstoppable.</span>
              </h1>
              <p className="text-sm sm:text-base text-cyan-300/90 font-medium">Built for JEE, NEET, and UPSC aspirants.</p>
            </motion.div>

            {/* Subheading */}
            <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Experience personalized learning powered by AI. Get instant doubt resolution, adaptive practice, real-time progress tracking, and a gamified journey to your success.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-lime-500 text-black hover:shadow-2xl hover:shadow-cyan-500/40 transition-all px-8 font-bold text-base" onClick={() => navigate("/signup")}>
                Start Learning Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 border-2 border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/5 font-semibold" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </div>
                  ))}
                </div>
                <span><strong className="text-cyan-300">10,000+</strong> students learning</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4 text-lime-400 fill-lime-400" />
                <span><strong className="text-foreground">4.9/5</strong> rating</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FEATURES SECTION - CARD GRID REDESIGN
          ══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Why Students <span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">Love RankYodha</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need to excel in your exams, powered by cutting-edge AI technology</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={containerVariants} className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={itemVariants} whileHover={{ y: -12, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }} className="group relative rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/30 p-8 overflow-hidden cursor-default transition-all duration-300">
                {/* Gradient overlay on hover */}
                <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 bg-gradient-to-br ${f.color}`} style={{ filter: "blur(60px)" }} />

                {/* Number badge */}
                <div className="absolute top-6 right-6 text-5xl font-black opacity-10 text-foreground group-hover:opacity-20 transition-opacity">{f.number}</div>

                {/* Icon */}
                <motion.div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg`} whileHover={{ scale: 1.1, rotate: 5 }}>
                  <f.icon className="h-7 w-7 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground mb-4">{f.desc}</p>
                <ArrowRight className="h-5 w-5 text-cyan-400 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          EXAMS SECTION - BOLD SHOWCASE
          ══════════════════════════════════════════════════════════════════ */}
      <section id="exams" className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background relative">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              Ace Your <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">Target Exam</span>
            </h2>
            <p className="text-muted-foreground text-lg">Comprehensive preparation for India's most challenging entrance exams</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={containerVariants} className="grid md:grid-cols-3 gap-8">
            {exams.map((e, i) => (
              <motion.div
                key={e.name}
                variants={itemVariants}
                whileHover={{ y: -15, boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}
                className="group relative rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/20 overflow-hidden"
              >
                {/* Animated corner gradient */}
                <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 bg-gradient-to-br ${e.color}`} style={{ filter: "blur(80px)" }} />

                {/* Content */}
                <div className="p-8 h-full flex flex-col">
                  {/* Logo */}
                  <motion.div className={`h-24 w-24 rounded-2xl ${e.bg} border ${e.border} flex items-center justify-center mb-6`} whileHover={{ scale: 1.15, rotate: 8 }}>
                    <div className="w-14 h-14">
                      <e.logo />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-3xl font-black mb-1">{e.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{e.full}</p>

                  {/* Description */}
                  <p className="text-foreground mb-4 flex-grow">{e.desc}</p>

                  {/* Stats */}
                  <div className={`px-4 py-3 rounded-lg bg-gradient-to-r ${e.color} bg-opacity-10 border border-current border-opacity-20 mb-6`}>
                    <span className="text-sm font-semibold text-foreground">{e.topics}</span>
                  </div>

                  {/* CTA */}
                  <Button className={`w-full bg-gradient-to-r ${e.color} text-black hover:shadow-lg font-bold`} onClick={() => navigate("/signup")}>
                    Start {e.name} Prep
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          BENEFITS SECTION - GRID WITH ICONS
          ══════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">Everything You Need</span> to Succeed
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={containerVariants} className="grid sm:grid-cols-2 gap-8">
            {benefits.map((b) => (
              <motion.div key={b.title} variants={itemVariants} className="flex gap-6 group p-6 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <b.icon className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">{b.title}</h4>
                  <p className="text-muted-foreground">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          TESTIMONIALS SECTION
          ══════════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-lime-400 to-green-400 bg-clip-text text-transparent">Success Stories</span> From Real Students
            </h2>
            <p className="text-muted-foreground text-lg">See how RankYodha has transformed learning for thousands</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={containerVariants} className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={itemVariants} whileHover={{ y: -10 }} className="rounded-2xl border border-border/50 bg-gradient-to-br from-background to-muted/20 p-8 group relative overflow-hidden">
                <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 bg-gradient-to-br ${t.color}`} style={{ filter: "blur(60px)" }} />

                {/* Quote icon */}
                <Quote className="h-8 w-8 text-muted-foreground mb-4" />

                {/* Testimonial */}
                <p className="text-foreground mb-6 italic font-medium leading-relaxed">"{t.quote}"</p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-2xl`}>{t.avatar}</div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.exam}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          CTA SECTION - BOLD
          ══════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-cyan-600/80 via-lime-600/80 to-green-600/80 p-12 md:p-20 text-center text-white relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-30 -z-10">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-40 -right-40 w-80 h-80 rounded-full border border-white/20" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full border border-white/10" />
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black leading-tight">
              Your Success Starts <br /> with a Single Click
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">Join thousands of students who are already acing their exams. Start your free trial today — no credit card required!</p>

            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-white/90 shadow-2xl font-bold px-8" onClick={() => navigate("/signup")}>
                Get Started Free
                <Sparkles className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-bold px-8" onClick={() => navigate("/auth")}>
                Login to Account
              </Button>
            </motion.div>

            <p className="text-sm text-white/80 pt-4">🎓 Perfect for JEE, NEET & UPSC preparations</p>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-border/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-lime-500 flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-foreground">RankYodha</span>
            </div>
            <p>&copy; 2026 RankYodha. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

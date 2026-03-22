import { motion } from "framer-motion";
import {
  Brain,
  User,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
  Trophy,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, saveAuthSession } from "@/lib/api";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  };

  const handleSendOtp = () => {
    alert("OTP signup is not configured. Please use password signup.");
  };

  const handleVerifyOtpAndSignup = async () => {
    alert("OTP signup is not configured. Please use password signup.");
  };

  const handlePasswordSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiRequest<{ token: string; user: { id: string; name: string; email: string } }>(
        "/api/v1/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ name, email, password })
        }
      );
      saveAuthSession(data.token, data.user);
      navigate("/dashboard");
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Signup failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="relative min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,.14),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(132,204,22,.14),transparent_45%)]" />
          <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-lime-500/20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[.95fr_1.05fr]"
        >
          <section className="hidden rounded-3xl border border-lime-500/20 bg-gradient-to-br from-lime-950/25 via-background to-cyan-950/25 p-8 shadow-2xl md:flex md:flex-col">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-lime-500 shadow-lg shadow-cyan-500/30">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">NeuroPrep AI</p>
                <p className="text-xs text-muted-foreground">Designed for top rankers</p>
              </div>
            </div>

            <h1 className="mb-3 text-4xl font-black leading-tight">
              Build your <span className="bg-gradient-to-r from-lime-400 to-cyan-400 bg-clip-text text-transparent">winning routine</span>.
            </h1>
            <p className="mb-8 max-w-md text-sm text-muted-foreground">
              Create your account to access adaptive practice, AI insights, and exam-specific learning tracks.
            </p>

            <div className="mt-auto space-y-4">
              <div className="rounded-xl border border-border/40 bg-background/60 p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-semibold"><Trophy className="h-4 w-4 text-lime-400" /> Daily wins matter</p>
                <p className="text-xs text-muted-foreground">Small consistent sessions are the fastest route to score growth.</p>
              </div>
              <div className="rounded-xl border border-border/40 bg-background/60 p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4 text-cyan-400" /> Focused targets</p>
                <p className="text-xs text-muted-foreground">Set your exam and get a curated roadmap from day one.</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border/50 bg-background/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <button onClick={() => navigate("/")} className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-lime-500">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-bold">NeuroPrep AI</span>
              </button>
              <span className="rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-medium text-lime-300">Signup</span>
            </div>

            <h1 className="mb-1 text-3xl font-black">Create Account</h1>
            <p className="mb-6 text-sm text-muted-foreground">Start your AI-powered learning journey today.</p>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11 gap-2 border-border/70 bg-background/60 hover:bg-muted/40">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
              <Button
                variant={isOtpMode ? "default" : "outline"}
                onClick={() => setIsOtpMode((prev) => !prev)}
                className={isOtpMode ? "h-11 bg-gradient-to-r from-cyan-500 to-lime-500 text-black hover:opacity-95" : "h-11"}
              >
                <KeyRound className="mr-2 h-4 w-4" />
                {isOtpMode ? "OTP Enabled" : "Sign up via OTP"}
              </Button>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="signup-name">Full Name</label>
                <div className="group relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 border-border/70 bg-background/50 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="signup-email">Email Address</label>
                <div className="group relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-border/70 bg-background/50 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="signup-password">Password</label>
                <div className="group relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-border/70 bg-background/50 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="signup-confirm">Confirm Password</label>
                <div className="group relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                  <Input
                    id="signup-confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 border-border/70 bg-background/50 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {isOtpMode && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="signup-otp">One-Time Password</label>
                  <div className="group relative">
                    <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                    <Input
                      id="signup-otp"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="h-11 border-border/70 bg-background/50 pl-10"
                    />
                  </div>
                </div>
              )}

              {isOtpMode ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" className="h-11" onClick={handleSendOtp}>
                      Send OTP
                    </Button>
                    <Button
                      type="button"
                      disabled={isSubmitting}
                      className="h-11 bg-gradient-to-r from-cyan-500 to-lime-500 font-semibold text-black hover:opacity-95"
                      onClick={handleVerifyOtpAndSignup}
                    >
                      {isSubmitting ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>

                  <p className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300">
                    Use password mode to create your account.
                  </p>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={handlePasswordSignup}
                  disabled={isSubmitting}
                  className="group mt-2 h-11 w-full bg-gradient-to-r from-cyan-500 to-lime-500 text-sm font-semibold text-black hover:opacity-95"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </form>

            <div className="mt-6 rounded-xl border border-border/50 bg-muted/20 p-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Pick OTP mode for demo flow, password mode for standard signup.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => navigate("/auth")} className="font-semibold text-cyan-400 hover:underline">
                Sign in
              </button>
            </p>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              By signing up, you agree to our <a href="#" className="text-cyan-400 hover:underline">Terms</a> and <a href="#" className="text-cyan-400 hover:underline">Privacy Policy</a>.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}

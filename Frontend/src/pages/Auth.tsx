import { motion } from "framer-motion";
import {
  Brain,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Flame,
  Sparkles,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, saveAuthSession } from "@/lib/api";

export default function Auth() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  };

  const handleSendOtp = () => {
    alert("OTP login is not configured. Please use password login.");
  };

  const handleVerifyOtp = () => {
    alert("OTP login is not configured. Please use password login.");
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await apiRequest<{ token: string; user: { id: string; name: string; email: string } }>(
        "/api/v1/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password })
        }
      );

      saveAuthSession(data.token, data.user);
      navigate("/dashboard");
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Login failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login is not configured yet.");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="relative min-h-screen px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,.06)_25%,rgba(6,182,212,.06)_50%,transparent_50%,transparent_75%,rgba(6,182,212,.06)_75%,rgba(6,182,212,.06))] bg-[length:58px_58px]" />
          <div className="absolute -top-36 -left-36 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute -bottom-36 -right-36 h-96 w-96 rounded-full bg-lime-500/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-3xl" />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mx-auto grid w-full max-w-6xl items-stretch gap-6 md:grid-cols-[1.05fr_.95fr]"
        >
          <motion.section
            variants={itemVariants}
            className="hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 via-background to-lime-950/20 p-8 shadow-2xl md:flex md:flex-col"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-lime-500 shadow-lg shadow-cyan-500/30">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold">NeuroPrep AI</p>
                <p className="text-xs text-muted-foreground">Smarter prep, faster results</p>
              </div>
            </div>

            <h1 className="mb-3 text-4xl font-black leading-tight">
              Keep the <span className="bg-gradient-to-r from-cyan-400 to-lime-400 bg-clip-text text-transparent">momentum</span>.
            </h1>
            <p className="mb-8 max-w-md text-sm text-muted-foreground">
              Sign in to continue your streak, unlock adaptive practice, and get exam-focused guidance built around your progress.
            </p>

            <div className="mt-auto space-y-4">
              <div className="rounded-xl border border-border/40 bg-background/60 p-4 backdrop-blur">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <Flame className="h-4 w-4 text-lime-400" />
                  Current streak bonus
                </div>
                <p className="text-xs text-muted-foreground">Complete one practice set today to preserve your streak multiplier.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-border/40 bg-background/60 p-3">
                  <p className="mb-1 flex items-center gap-1 font-semibold"><ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Secure auth</p>
                  <p className="text-muted-foreground">OTP and password mode</p>
                </div>
                <div className="rounded-lg border border-border/40 bg-background/60 p-3">
                  <p className="mb-1 flex items-center gap-1 font-semibold"><Star className="h-3.5 w-3.5 text-lime-400" /> Ranked prep</p>
                  <p className="text-muted-foreground">JEE, NEET, UPSC ready</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="rounded-3xl border border-border/50 bg-background/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <button onClick={() => navigate("/")} className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-lime-500">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-bold">NeuroPrep AI</span>
              </button>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">Login</span>
            </div>

            <h2 className="mb-1 text-3xl font-black">Welcome Back</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              {isOtpMode ? "Sign in using one-time password" : "Sign in with your email and password"}
            </p>

            {!isOtpMode && (
              <div className="mb-5">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="h-12 w-full gap-3 border-border/70 bg-background/60 hover:bg-muted/40"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            )}

            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-xs font-medium text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => {
                  setIsOtpMode(false);
                  setOtp("");
                }}
                variant={isOtpMode ? "outline" : "default"}
                className={isOtpMode ? "h-11" : "h-11 bg-gradient-to-r from-cyan-500 to-lime-500 text-black hover:opacity-95"}
              >
                <Lock className="mr-2 h-4 w-4" /> Password
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsOtpMode(true);
                  setOtp("");
                }}
                variant={isOtpMode ? "default" : "outline"}
                className={isOtpMode ? "h-11 bg-gradient-to-r from-cyan-500 to-lime-500 text-black hover:opacity-95" : "h-11"}
              >
                <KeyRound className="mr-2 h-4 w-4" /> OTP
              </Button>
            </div>

            <motion.form variants={itemVariants} className="space-y-4">
              {isOtpMode ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="login-email">Email Address</label>
                    <div className="group relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        className="h-11 border-border/70 bg-background/50 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="login-otp">One-Time Password</label>
                    <div className="group relative">
                      <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                      <Input
                        id="login-otp"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="h-11 border-border/70 bg-background/50 pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" className="h-11" onClick={handleSendOtp}>
                      Send OTP
                    </Button>
                    <Button
                      type="button"
                      className="h-11 bg-gradient-to-r from-cyan-500 to-lime-500 font-semibold text-black hover:opacity-95"
                      onClick={handleVerifyOtp}
                    >
                      Verify OTP
                    </Button>
                  </div>

                  <p className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300">
                    OTP login is currently unavailable. Use password sign in.
                  </p>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium" htmlFor="login-email">Email Address</label>
                    <div className="group relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 border-border/70 bg-background/50 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium" htmlFor="login-password">Password</label>
                      <a href="#" className="text-xs text-cyan-400 hover:underline">Forgot password?</a>
                    </div>
                    <div className="group relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-cyan-400" />
                      <Input
                        id="login-password"
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

                  <Button
                    type="button"
                    onClick={handlePasswordLogin}
                    disabled={isSubmitting}
                    className="group mt-2 h-11 w-full bg-gradient-to-r from-cyan-500 to-lime-500 text-sm font-semibold text-black hover:opacity-95"
                  >
                    {isSubmitting ? "Signing In..." : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </>
              )}
            </motion.form>

            <div className="mt-6 rounded-xl border border-border/50 bg-muted/20 p-3">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                Quick tip: use password mode for production backend login.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="font-semibold text-cyan-400 hover:underline">
                Sign up
              </button>
            </p>
          </motion.section>
        </motion.div>
      </div>
    </div>
  );
}

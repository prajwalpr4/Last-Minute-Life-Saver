"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  Zap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Brain,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ─── Google Icon SVG ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Animated side panel floating elements ───────────────────────────────────
function FloatingElement({
  children,
  className,
  delay = 0,
  duration = 5,
}: {
  children: React.ReactNode;
  className: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: delay * 0.2 + 0.5 }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 0.3,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ─── Form Submission ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          toast.error("Please enter your name");
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(email, password, name);
        toast.success("Account created! Welcome aboard 🎉");
      } else {
        await signInWithEmail(email, password);
        toast.success("Welcome back! 👋");
      }
      router.push("/dashboard");
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const errorMessages: Record<string, string> = {
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Invalid email or password. Please try again.",
        "auth/too-many-requests": "Too many attempts. Please wait and try again.",
      };
      toast.error(errorMessages[err.code || ""] || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex">
      {/* ═══════════════════════════════════════════════════════════════════════
          LEFT PANEL — Branding & Animated Visuals
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary">
        {/* Overlay pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="bg-dots absolute inset-0" />
        </div>

        {/* Gradient overlays */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-semibold text-white tracking-tight">
                LastMinSaver
              </span>
            </Link>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-16"
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Your AI-powered
              <br />
              productivity agent
            </h1>
            <p className="text-lg text-white/70 font-light max-w-md leading-relaxed">
              Let artificial intelligence handle the planning while you focus on execution.
            </p>
          </motion.div>

          {/* Floating UI Elements */}
          <div className="relative h-64">
            <FloatingElement
              className="top-0 left-0"
              delay={1}
              duration={5}
            >
              <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex items-center gap-3 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Brain Dump Active</p>
                  <p className="text-xs text-white/60">3 tasks extracted</p>
                </div>
              </div>
            </FloatingElement>

            <FloatingElement
              className="top-4 right-0"
              delay={2}
              duration={6}
            >
              <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex items-center gap-3 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Calendar Synced</p>
                  <p className="text-xs text-white/60">5 events scheduled</p>
                </div>
              </div>
            </FloatingElement>

            <FloatingElement
              className="bottom-4 left-8"
              delay={3}
              duration={4.5}
            >
              <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex items-center gap-3 shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Task Completed!</p>
                  <p className="text-xs text-white/60">Research paper outline</p>
                </div>
              </div>
            </FloatingElement>

            <FloatingElement
              className="bottom-0 right-4"
              delay={4}
              duration={5.5}
            >
              <div className="bg-gradient-to-r from-red-500/80 to-orange-500/80 backdrop-blur-md rounded-xl border border-white/20 px-4 py-2.5 flex items-center gap-2 shadow-xl">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span className="text-xs font-semibold text-white">
                  PANIC MODE READY
                </span>
              </div>
            </FloatingElement>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          RIGHT PANEL — Auth Form
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold text-foreground tracking-tight">
                LastMin<span className="gradient-text">Saver</span>
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? "signup" : "signin"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                  {isSignUp ? "Create your account" : "Welcome back"}
                </h2>
                <p className="text-muted-foreground font-light">
                  {isSignUp
                    ? "Start your productivity journey with AI"
                    : "Sign in to continue crushing deadlines"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>



          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (sign up only) */}
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <label
                    htmlFor="auth-name"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="input !pl-10"
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input !pl-10"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="auth-password"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input !pl-10 !pr-10"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setName("");
                  setPassword("");
                }}
                className="font-medium text-primary hover:text-primary-hover transition-colors"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

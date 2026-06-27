"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// Floating orb background element
function FloatingOrb({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-30 pointer-events-none ${className}`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

// Animated task cards that float in the hero
function FloatingTaskCard({
  title,
  priority,
  delay,
  className,
}: {
  title: string;
  priority: "high" | "medium" | "low";
  delay: number;
  className: string;
}) {
  const priorityColors = {
    high: "bg-red-50 border-red-200 text-red-700",
    medium: "bg-amber-50 border-amber-200 text-amber-700",
    low: "bg-emerald-50 border-emerald-200 text-emerald-700",
  };

  const priorityBadge = {
    high: "badge-destructive",
    medium: "badge-warning",
    low: "badge-success",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 4 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`glass-panel p-4 min-w-[200px]`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground leading-snug">
              {title}
            </p>
            <span className={`badge mt-2 text-xs ${priorityBadge[priority]}`}>
              {priority}
            </span>
          </div>
          <CheckCircle2
            className={`w-5 h-5 mt-0.5 ${
              priority === "low" ? "text-emerald-400" : "text-slate-200"
            }`}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-dots" />
      <FloatingOrb
        className="w-[500px] h-[500px] bg-indigo-300 -top-20 -left-40"
        delay={0}
      />
      <FloatingOrb
        className="w-[400px] h-[400px] bg-blue-300 top-1/3 -right-32"
        delay={2}
      />
      <FloatingOrb
        className="w-[300px] h-[300px] bg-cyan-300 bottom-10 left-1/4"
        delay={4}
      />

      {/* Radial fade at edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div className="text-center lg:text-left space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini AI
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
          >
            Never Miss a{" "}
            <span className="gradient-text">Deadline</span>{" "}
            Again.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground font-light max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            An AI agent that goes beyond reminders — it{" "}
            <strong className="text-foreground font-medium">autonomously plans</strong>,{" "}
            <strong className="text-foreground font-medium">schedules</strong>, and{" "}
            <strong className="text-foreground font-medium">executes</strong>{" "}
            your tasks so you can focus on what matters.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap items-center gap-4 justify-center lg:justify-start"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="btn btn-primary text-base px-8 py-3 gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="btn btn-secondary text-base px-8 py-3"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center gap-4 justify-center lg:justify-start pt-2"
          >
            <div className="flex -space-x-2">
              {["bg-indigo-400", "bg-blue-400", "bg-cyan-400", "bg-emerald-400"].map(
                (bg, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-xs font-medium`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                )
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">1,200+</span>{" "}
              procrastinators saved
            </p>
          </motion.div>
        </div>

        {/* Right: Floating UI mockup */}
        <div className="relative hidden lg:block h-[500px]">
          {/* Main dashboard card mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="absolute top-8 left-8 right-0 glass-panel p-6 z-10"
          >
            {/* Mock header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <div className="flex-1" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>

            {/* Mock brain dump input */}
            <div className="bg-muted/50 rounded-xl p-4 mb-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">BRAIN DUMP</span>
              </div>
              <div className="space-y-2">
                <div className="skeleton h-3 w-full rounded" />
                <div className="skeleton h-3 w-4/5 rounded" />
                <div className="skeleton h-3 w-3/5 rounded" />
              </div>
              <div className="flex gap-2 mt-3">
                <div className="btn btn-primary text-xs px-3 py-1.5">
                  <Sparkles className="w-3 h-3" />
                  Extract Tasks
                </div>
              </div>
            </div>

            {/* Mock task list */}
            <div className="space-y-2">
              {[
                { t: "Research paper outline", b: "badge-destructive", p: "urgent" },
                { t: "Book study room", b: "badge-warning", p: "medium" },
                { t: "Submit form", b: "badge-success", p: "low" },
              ].map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.15 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded border-2 border-border" />
                    <span className="text-sm text-foreground font-medium">
                      {task.t}
                    </span>
                  </div>
                  <span className={`badge text-[10px] ${task.b}`}>{task.p}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Floating cards */}
          <FloatingTaskCard
            title="Study for finals 📚"
            priority="high"
            delay={0.6}
            className="top-0 -left-4 z-20"
          />
          <FloatingTaskCard
            title="Call dentist 🦷"
            priority="low"
            delay={1.0}
            className="bottom-16 -right-4 z-20"
          />

          {/* Calendar widget floating */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="absolute bottom-0 left-0 z-20"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="glass-panel p-4 w-[180px]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-xs font-medium text-muted-foreground">TODAY</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full bg-primary" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Focus Time</p>
                    <p className="text-[10px] text-muted-foreground">2:00 - 4:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Review</p>
                    <p className="text-[10px] text-muted-foreground">5:00 - 5:30 PM</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Panic button floating */}
          <motion.div
            initial={{ opacity: 0, rotate: 12 }}
            animate={{ opacity: 1, rotate: 6 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="absolute top-2 right-0 z-30"
          >
            <motion.div
              animate={{ rotate: [6, 3, 6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-xl shadow-lg shadow-red-300/40 px-4 py-2.5 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-semibold">PANIC MODE</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

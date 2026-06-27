"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Mic, ImagePlus } from "lucide-react";

function PulseRing() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-50 sm:scale-75 lg:scale-100">
      {/* Outer rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            width: `${280 + i * 100}px`,
            height: `${280 + i * 100}px`,
            borderColor: i === 0 ? "rgba(76,63,224,0.25)" : i === 1 ? "rgba(43,183,168,0.15)" : "rgba(76,63,224,0.08)",
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1, 1.08, 1],
                  opacity: [0.6, 0.3, 0.6],
                }
          }
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}

      {/* Core glow */}
      <motion.div
        className="absolute w-48 h-48 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(76,63,224,0.15) 0%, rgba(43,183,168,0.08) 50%, transparent 70%)",
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: [1, 1.2, 1],
                opacity: [0.8, 0.4, 0.8],
              }
        }
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Center dot */}
      <div className="absolute w-4 h-4 rounded-full bg-[#4C3FE0] shadow-lg shadow-[#4C3FE0]/30" />
    </div>
  );
}

function ProductPreview() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* Browser chrome */}
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_-12px_rgba(76,63,224,0.15)] border border-slate-200/80 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div className="flex-1 text-center">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">lastminsaver.app</span>
          </div>
        </div>

        <div className="p-5">
          {/* Brain Dump */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2.5">
              <Brain className="w-4 h-4 text-[#4C3FE0]" />
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Brain Dump</span>
            </div>
            <div className="bg-[#FAFAF7] rounded-xl p-3.5 border border-slate-200/60">
              <motion.p
                className="text-sm text-slate-600 leading-relaxed"
                initial={shouldReduceMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                &quot;I have a research paper due tomorrow, need to study for my calc exam on Thursday, and I forgot to book the study room...&quot;
              </motion.p>
              <div className="flex items-center gap-2 mt-3">
                <button className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                  <Mic className="w-3 h-3" /> Voice
                </button>
                <button className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                  <ImagePlus className="w-3 h-3" /> Image
                </button>
                <div className="flex-1" />
                <motion.div
                  className="inline-flex items-center gap-1.5 text-[10px] text-white font-semibold px-3 py-1.5 rounded-lg bg-[#4C3FE0] shadow-sm"
                  animate={shouldReduceMotion ? {} : { boxShadow: ["0 0 0 0 rgba(76,63,224,0.3)", "0 0 0 6px rgba(76,63,224,0)", "0 0 0 0 rgba(76,63,224,0.3)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3" /> Extract
                </motion.div>
              </div>
            </div>
          </div>

          {/* Extracted tasks */}
          <div className="space-y-2">
            {[
              { title: "Research paper outline", priority: "urgent", color: "#FF5A36" },
              { title: "Study for calc exam", priority: "high", color: "#E8A33D" },
              { title: "Book study room", priority: "medium", color: "#2BB7A8" },
            ].map((task, i) => (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + i * 0.15, duration: 0.4 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100 hover:border-[#4C3FE0]/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded border-2 border-slate-200" />
                  <span className="text-xs font-medium text-slate-700">{task.title}</span>
                </div>
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ color: task.color, backgroundColor: `${task.color}12` }}
                >
                  {task.priority}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomeHero() {
  const shouldReduceMotion = useReducedMotion();

  const stagger = {
    initial: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative min-h-[calc(100dvh-4rem)] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 sm:pb-16" style={{ backgroundColor: "#FAFAF7" }}>
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#4C3FE0 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Pulse Ring behind content */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <PulseRing />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FAFAF7] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        {/* Left: Copy */}
        <div className="text-center lg:text-left space-y-5 sm:space-y-7 z-10">
          {/* Badge */}
          <motion.div {...stagger} transition={{ duration: 0.6, delay: 0.1 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4C3FE0]/5 border border-[#4C3FE0]/10 text-[#4C3FE0] text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Powered by Google Gemini 3.1 Pro
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...stagger}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-6xl font-bold tracking-tight leading-[1.1]"
            style={{ color: "#1a1a2e" }}
          >
            Your AI Agent for{" "}
            <span style={{ color: "#4C3FE0" }}>Deadline</span>{" "}
            Survival.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            {...stagger}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-base sm:text-lg md:text-xl text-slate-500 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Brain-dump your chaos. Our AI agents{" "}
            <strong className="text-slate-700 font-medium">extract tasks</strong>,{" "}
            <strong className="text-slate-700 font-medium">auto-schedule</strong>, and deploy{" "}
            <strong className="text-slate-700 font-medium">panic survival plans</strong>{" "}
            — so you never miss another deadline.
          </motion.p>

          {/* CTAs */}
          <motion.div
            {...stagger}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center lg:justify-start w-full"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-3.5 rounded-xl text-white shadow-lg shadow-[#4C3FE0]/20 hover:shadow-xl hover:shadow-[#4C3FE0]/30 transition-shadow w-full sm:w-auto"
                style={{ backgroundColor: "#4C3FE0" }}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-base font-medium px-8 py-3.5 rounded-xl text-slate-600 bg-white border border-slate-200 hover:border-[#4C3FE0]/30 hover:text-[#4C3FE0] transition-colors shadow-sm w-full sm:w-auto"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            {...stagger}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="flex items-center gap-4 justify-center lg:justify-start pt-2"
          >
            <div className="flex -space-x-2.5">
              {["#4C3FE0", "#2BB7A8", "#E8A33D", "#FF5A36"].map((bg, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#FAFAF7] flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                  style={{ backgroundColor: bg }}
                >
                  {String.fromCharCode(80 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-slate-600">1,200+</span> procrastinators rescued
            </p>
          </motion.div>
        </div>

        {/* Right: Product Preview */}
        <div className="relative z-10">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}

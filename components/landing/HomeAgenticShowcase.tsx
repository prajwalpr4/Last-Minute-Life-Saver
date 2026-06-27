"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Brain, Sparkles, CalendarClock, Zap, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Brain,
    title: "Brain Dump",
    subtitle: "Speak, type, or upload",
    description: "Dump your chaotic thoughts via voice, text, or image. Our AI instantly understands context, urgency, and dependencies.",
    color: "#4C3FE0",
    bgColor: "rgba(76,63,224,0.06)",
    borderColor: "rgba(76,63,224,0.12)",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI Extraction",
    subtitle: "Tasks auto-generated",
    description: "Gemini 3.1 Pro parses your dump into structured tasks with priorities, deadlines, and subtasks — no manual input needed.",
    color: "#2BB7A8",
    bgColor: "rgba(43,183,168,0.06)",
    borderColor: "rgba(43,183,168,0.12)",
  },
  {
    step: "03",
    icon: CalendarClock,
    title: "Auto-Schedule",
    subtitle: "Intelligent planning",
    description: "Each task is assigned to your calendar based on priority, deadline proximity, and your behavioral profile — automatically.",
    color: "#E8A33D",
    bgColor: "rgba(232,163,61,0.06)",
    borderColor: "rgba(232,163,61,0.12)",
  },
  {
    step: "04",
    icon: Zap,
    title: "Execute & Rescue",
    subtitle: "Autonomous agents act",
    description: "If a deadline is at risk, Panic Mode deploys a minute-by-minute survival plan. The AI acts autonomously to save your schedule.",
    color: "#FF5A36",
    bgColor: "rgba(255,90,54,0.06)",
    borderColor: "rgba(255,90,54,0.12)",
  },
];

export default function HomeAgenticShowcase() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" style={{ backgroundColor: "#FAFAF7" }}>
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-20">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
            style={{ color: "#4C3FE0", backgroundColor: "rgba(76,63,224,0.06)" }}
          >
            Agentic AI Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight" style={{ color: "#1a1a2e" }}>
            Not a To-Do List.{" "}
            <span style={{ color: "#4C3FE0" }}>An Autonomous Agent.</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 font-light leading-relaxed">
            LastMinSaver runs a four-step agentic pipeline that transforms raw panic into structured execution — no manual planning required.
          </p>
        </motion.div>
      </div>

      {/* Pipeline flow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative group"
              >
                {/* Connector arrow (between cards on desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 z-10 transform -translate-y-1/2">
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </div>
                )}

                <motion.div
                  whileHover={{ y: -4, boxShadow: `0 20px 40px -12px ${step.color}15` }}
                  transition={{ duration: 0.2 }}
                  className="relative h-full p-6 rounded-2xl bg-white border transition-colors cursor-default"
                  style={{ borderColor: step.borderColor }}
                >
                  {/* Step number */}
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest mb-4 block"
                    style={{ color: step.color }}
                  >
                    Step {step.step}
                  </span>

                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: step.bgColor }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{step.title}</h3>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">{step.subtitle}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

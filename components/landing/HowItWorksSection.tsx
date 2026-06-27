"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  MessageSquarePlus,
  Sparkles,
  CalendarPlus,
  Rocket,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <MessageSquarePlus className="w-6 h-6 text-indigo-600" />,
    title: "Dump Everything",
    description:
      "Text, voice, or snap a photo of your messy notes. Don't organize — just dump.",
    color: "from-indigo-500 to-indigo-600",
    bgLight: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  {
    step: "02",
    icon: <Sparkles className="w-6 h-6 text-blue-600" />,
    title: "AI Extracts & Plans",
    description:
      "Gemini AI parses your input, extracts tasks, estimates effort, and creates a plan.",
    color: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    step: "03",
    icon: <CalendarPlus className="w-6 h-6 text-cyan-600" />,
    title: "Auto-Schedule",
    description:
      "Tasks are broken into subtasks and automatically blocked on your Google Calendar.",
    color: "from-cyan-500 to-cyan-600",
    bgLight: "bg-cyan-50",
    borderColor: "border-cyan-200",
  },
  {
    step: "04",
    icon: <Rocket className="w-6 h-6 text-emerald-600" />,
    title: "Execute & Relax",
    description:
      "Follow the schedule, check off tasks, or hit Panic Mode if time is running out.",
    color: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
];

export default function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="how-it-works"
      className="relative py-32 px-6 bg-gradient-to-b from-background via-muted/30 to-background"
    >
      <div className="max-w-5xl mx-auto" ref={ref}>
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="badge badge-success px-4 py-1.5 mb-6 text-sm"
          >
            🚀 Simple Workflow
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
          >
            How It <span className="gradient-text">Works</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground font-light"
          >
            From chaos to clarity in four effortless steps.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[2.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-blue-200 via-cyan-200 to-emerald-200 hidden md:block" />

          <div className="space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={
                  isInView
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -30 }
                }
                transition={{
                  duration: 0.6,
                  delay: 0.3 + i * 0.15,
                  ease: "easeOut",
                }}
                className="flex items-start gap-8"
              >
                {/* Step number circle */}
                <div className="relative flex-shrink-0 hidden md:flex">
                  <div
                    className={`w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-lg font-bold shadow-lg`}
                  >
                    {step.step}
                  </div>
                </div>

                {/* Card */}
                <motion.div
                  whileHover={{ x: 8 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-1 glass-panel p-6 md:p-8 border-l-4 ${step.borderColor}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${step.bgLight} flex items-center justify-center flex-shrink-0`}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <div className="md:hidden mb-1">
                        <span
                          className={`text-xs font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                        >
                          STEP {step.step}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2 tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground font-light leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

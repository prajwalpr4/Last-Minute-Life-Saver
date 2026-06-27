"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  FlaskConical,
  LifeBuoy,
  PenTool,
  UserCircle,
} from "lucide-react";

const features = [
  {
    icon: AlertTriangle,
    title: "Panic Mode",
    tagline: "3 hours left? We've got this.",
    description:
      "When a deadline is hours away, Panic Mode generates a hyper-compressed, minute-by-minute survival schedule. It cuts non-essentials ruthlessly and tells you exactly what to do, in what order, right now.",
    color: "#FF5A36",
    bgColor: "rgba(255,90,54,0.06)",
    borderColor: "rgba(255,90,54,0.15)",
    badge: "SURVIVAL",
  },
  {
    icon: FlaskConical,
    title: "What-If Simulator",
    tagline: "Test timelines before committing.",
    description:
      'Ask "What if I skip class to finish my project?" and the AI simulates both timelines against your real schedule — warning you of cascading failures and tradeoffs without touching your actual data.',
    color: "#4C3FE0",
    bgColor: "rgba(76,63,224,0.06)",
    borderColor: "rgba(76,63,224,0.15)",
    badge: "READ-ONLY",
  },
  {
    icon: LifeBuoy,
    title: "Deadline Rescue",
    tagline: "Autonomous schedule surgery.",
    description:
      "When the AI detects an impending failure, it proactively proposes schedule reorganizations — moving low-priority events to carve out rescue blocks for your critical deadlines.",
    color: "#E8A33D",
    bgColor: "rgba(232,163,61,0.06)",
    borderColor: "rgba(232,163,61,0.15)",
    badge: "PROACTIVE",
  },
  {
    icon: PenTool,
    title: "Deep Work Drafter",
    tagline: "Never start from a blank page.",
    description:
      "The AI generates structural outlines, boilerplate code, or essay drafts instantly — attached directly to your tasks. Defeat the 'starting friction' that kills productivity.",
    color: "#2BB7A8",
    bgColor: "rgba(43,183,168,0.06)",
    borderColor: "rgba(43,183,168,0.15)",
    badge: "GENERATIVE",
  },
  {
    icon: UserCircle,
    title: "Behavioral Profiling",
    tagline: "AI that learns how you work.",
    description:
      'Analyzes your task completion patterns and generates a unique productivity profile — like "The Midnight Sprinter" or "The Caffeinated Perfectionist" — with personalized advice on your optimal work rhythms.',
    color: "#7C3AED",
    bgColor: "rgba(124,58,237,0.06)",
    borderColor: "rgba(124,58,237,0.15)",
    badge: "ADAPTIVE",
  },
];

export default function HomeFeatures() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 sm:py-32" style={{ backgroundColor: "#F5F5F0" }}>
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-20">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
            style={{ color: "#FF5A36", backgroundColor: "rgba(255,90,54,0.06)" }}
          >
            Standout Features
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
            style={{ color: "#1a1a2e" }}
          >
            Every Feature Built for{" "}
            <span style={{ color: "#FF5A36" }}>Crisis Mode.</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 font-light leading-relaxed">
            These aren&apos;t generic productivity features. Every one was designed for the moment you realize you&apos;re out of time.
          </p>
        </motion.div>
      </div>

      {/* Feature cards — asymmetric grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top row: 2 large cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {features.slice(0, 2).map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -4, boxShadow: `0 20px 40px -12px ${feature.color}15` }}
                  transition={{ duration: 0.2 }}
                  className="relative h-full p-8 rounded-2xl bg-white border transition-all cursor-default overflow-hidden"
                  style={{ borderColor: feature.borderColor }}
                >
                  {/* Badge */}
                  <span
                    className="inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-5"
                    style={{ color: feature.color, backgroundColor: feature.bgColor }}
                  >
                    {feature.badge}
                  </span>

                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: feature.bgColor }}
                    >
                      <Icon className="w-7 h-7" style={{ color: feature.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{feature.title}</h3>
                      <p className="text-sm font-medium mb-3" style={{ color: feature.color }}>
                        {feature.tagline}
                      </p>
                      <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom row: 3 smaller cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.slice(2).map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -4, boxShadow: `0 20px 40px -12px ${feature.color}15` }}
                  transition={{ duration: 0.2 }}
                  className="relative h-full p-6 rounded-2xl bg-white border transition-all cursor-default"
                  style={{ borderColor: feature.borderColor }}
                >
                  <span
                    className="inline-block text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4"
                    style={{ color: feature.color, backgroundColor: feature.bgColor }}
                  >
                    {feature.badge}
                  </span>

                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-1">{feature.title}</h3>
                  <p className="text-xs font-medium mb-3" style={{ color: feature.color }}>
                    {feature.tagline}
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

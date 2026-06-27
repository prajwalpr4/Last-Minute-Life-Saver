"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp, Clock, Zap, Users } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "1,200+",
    label: "Procrastinators Rescued",
    description: "Students who stopped panicking",
    color: "#4C3FE0",
    bgColor: "rgba(76,63,224,0.06)",
  },
  {
    icon: Zap,
    value: "8,400+",
    label: "Tasks Auto-Planned",
    description: "Zero manual scheduling required",
    color: "#2BB7A8",
    bgColor: "rgba(43,183,168,0.06)",
  },
  {
    icon: Clock,
    value: "94%",
    label: "Deadlines Met",
    description: "After activating Panic Mode",
    color: "#FF5A36",
    bgColor: "rgba(255,90,54,0.06)",
  },
  {
    icon: TrendingUp,
    value: "3.2x",
    label: "Productivity Boost",
    description: "Average improvement in first week",
    color: "#E8A33D",
    bgColor: "rgba(232,163,61,0.06)",
  },
];

export default function HomeSocialProof() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" style={{ backgroundColor: "#FAFAF7" }}>
      {/* Decorative bg */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(#4C3FE0 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
            style={{ color: "#2BB7A8", backgroundColor: "rgba(43,183,168,0.06)" }}
          >
            Impact
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
            style={{ color: "#1a1a2e" }}
          >
            Built for Results,{" "}
            <span style={{ color: "#2BB7A8" }}>Not Features.</span>
          </h2>
          <p className="mt-5 text-lg text-slate-500 font-light leading-relaxed">
            Every metric below represents a procrastinator who stopped panicking and started executing.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="relative h-full p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 text-center cursor-default"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 mb-1">{stat.label}</p>
                  <p className="text-xs text-slate-400">{stat.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Testimonial quote */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-3xl mx-auto text-center"
        >
          <blockquote className="relative">
            <span className="text-6xl font-serif leading-none absolute -top-4 -left-2" style={{ color: "rgba(76,63,224,0.15)" }}>&ldquo;</span>
            <p className="text-lg sm:text-xl text-slate-600 font-light leading-relaxed italic pl-6">
              I had 4 hours before my research paper was due and I hadn&apos;t started. Panic Mode gave me a minute-by-minute plan and I actually submitted it on time. This app literally saved my grade.
            </p>
          </blockquote>
          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#4C3FE0" }}>
              A
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-700">Aarav K.</p>
              <p className="text-xs text-slate-400">Engineering Student</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

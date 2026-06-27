"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function HomeFinalCTA() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" style={{ backgroundColor: "#4C3FE0" }}>
      {/* Pulse ring ambient */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: `${400 + i * 150}px`,
              height: `${400 + i * 150}px`,
              borderColor: `rgba(255,255,255,${0.08 - i * 0.02})`,
            }}
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [1, 1.05, 1],
                    opacity: [0.4, 0.15, 0.4],
                  }
            }
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Zap className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white mb-6">
            Stop Panicking.{" "}
            <br className="hidden sm:block" />
            Start Surviving.
          </h2>
          <p className="text-lg sm:text-xl text-white/70 font-light leading-relaxed mb-10 max-w-xl mx-auto">
            Join 1,200+ procrastinators who turned deadline chaos into structured execution — powered by autonomous AI agents.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-base font-semibold px-8 py-3.5 rounded-xl bg-white shadow-lg shadow-black/10 hover:shadow-xl transition-shadow w-full sm:w-auto"
                style={{ color: "#4C3FE0" }}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-base font-medium px-8 py-3.5 rounded-xl text-white border border-white/20 hover:bg-white/10 transition-colors w-full sm:w-auto"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

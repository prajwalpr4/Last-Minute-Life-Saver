"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  Clock,
  Lightbulb,
  Loader2,
  Zap,
} from "lucide-react";
import type { PanicSchedule } from "@/types";

interface PanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: PanicSchedule | null;
  isLoading: boolean;
}

export default function PanicModal({
  isOpen,
  onClose,
  schedule,
  isLoading,
}: PanicModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Centered Overlay Wrapper */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              backgroundColor: [
                "rgba(0, 0, 0, 0.6)",
                "rgba(220, 38, 38, 0.3)",
                "rgba(0, 0, 0, 0.6)",
              ],
            }}
            transition={{
              backgroundColor: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[85vh] bg-background border-2 border-red-500 rounded-2xl shadow-[0_0_80px_-12px_rgba(220,38,38,0.7)] overflow-hidden flex flex-col"
            >
              {/* Header — panic gradient */}
              <div className="gradient-panic px-6 py-5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  >
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      🚨 PANIC MODE
                    </h2>
                    <p className="text-xs text-white/80">
                      Hyper-compressed survival schedule
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Zap className="w-8 h-8 text-orange-500" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        Generating survival plan...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI is building your hyper-compressed schedule
                      </p>
                    </div>
                    {/* Skeleton steps */}
                    <div className="w-full space-y-3 mt-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="flex gap-3 animate-pulse"
                        >
                          <div className="w-20 h-4 skeleton rounded" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 skeleton rounded w-3/4" />
                            <div className="h-3 skeleton rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : schedule ? (
                  <div className="space-y-6">
                    {/* Task info */}
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <p className="text-xs font-medium text-red-500 uppercase tracking-wider mb-1">
                        MISSION
                      </p>
                      <p className="text-sm font-semibold text-red-800">
                        {schedule.taskTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-red-600">
                          {schedule.totalTime}
                        </span>
                      </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        SURVIVAL SCHEDULE
                      </p>
                      {schedule.steps.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-3 group"
                        >
                          {/* Time */}
                          <div className="flex-shrink-0 w-24 text-right">
                            <span className="text-xs font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {step.time}
                            </span>
                          </div>

                          {/* Timeline dot */}
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5 ring-4 ring-indigo-50" />
                            {i < schedule.steps.length - 1 && (
                              <div className="w-px flex-1 bg-indigo-100 my-1" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-medium text-foreground">
                              {step.action}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 font-light">
                              {step.details}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Tips */}
                    {schedule.tips.length > 0 && (
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-amber-600" />
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                            SURVIVAL TIPS
                          </p>
                        </div>
                        <ul className="space-y-1.5">
                          {schedule.tips.map((tip, i) => (
                            <li
                              key={i}
                              className="text-xs text-amber-800 font-light flex items-start gap-2"
                            >
                              <span className="text-amber-500 mt-0.5">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No schedule generated yet.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-red-200/50 bg-red-50/50 px-6 py-4 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="btn w-full py-2.5 bg-red-600 hover:bg-red-700 text-white shadow-md"
                >
                  Got it, let&apos;s go! 💪
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

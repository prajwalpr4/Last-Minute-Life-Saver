"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Loader2, ArrowRight, AlertTriangle, Scale, Target } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/types";

interface WhatIfSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  tasks: Task[];
  googleToken?: string;
}

export default function WhatIfSimulator({ isOpen, onClose, userId, tasks, googleToken }: WhatIfSimulatorProps) {
  const [scenario, setScenario] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenario.trim()) return;

    setIsSimulating(true);
    setResult(null);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId, scenario, tasks, googleToken }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setResult(json.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to run simulation.");
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Scale className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  What-If Simulator
                  <span className="badge badge-info text-[10px] uppercase tracking-wider">Read-Only</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">Test schedule changes safely before committing</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50 flex flex-col gap-6">
            
            <form onSubmit={handleSimulate} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., What if I skip classes tomorrow to finish my project?"
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-600"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              />
              <button
                type="submit"
                disabled={!scenario.trim() || isSimulating}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Simulate
              </button>
            </form>

            {isSimulating && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-400 animate-pulse font-medium">Running timelines in 3.1 Pro...</p>
              </div>
            )}

            {result && !isSimulating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Conclusion */}
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <h3 className="text-sm font-semibold text-indigo-400 mb-1">Strategic Recommendation</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{result.conclusion}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Warnings */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" /> Critical Risks
                    </h3>
                    <ul className="space-y-2">
                      {result.warnings?.map((w: string, i: number) => (
                        <li key={i} className="text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200/90 leading-snug">
                          {w}
                        </li>
                      ))}
                      {(!result.warnings || result.warnings.length === 0) && (
                        <li className="text-sm text-slate-500 italic">No critical risks identified.</li>
                      )}
                    </ul>
                  </div>

                  {/* Tradeoffs */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                      <Scale className="w-4 h-4 text-amber-400" /> Trade-offs
                    </h3>
                    <ul className="space-y-2">
                      {result.tradeoffs?.map((t: string, i: number) => (
                        <li key={i} className="text-sm p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200/90 leading-snug">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Affected Tasks */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" /> Affected Tasks
                  </h3>
                  <div className="space-y-2">
                    {result.affectedTasks?.map((task: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                        <div className="mt-0.5">
                          {task.impact === "improved" ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">↑</div>
                          ) : task.impact === "failed" ? (
                            <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs">✕</div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">!</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-200">{task.taskTitle}</p>
                          <p className="text-xs text-slate-400 mt-1">{task.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

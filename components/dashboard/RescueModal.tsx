"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, ArrowRight, Calendar, Check, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  proposal: any;
}

export default function RescueModal({ isOpen, onClose, onConfirm, proposal }: RescueModalProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen || !proposal) return null;

  const handleConfirm = async () => {
    setIsExecuting(true);
    try {
      await onConfirm();
      toast.success("Schedule successfully rescued! 🦸‍♂️");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to execute rescue operations.");
    } finally {
      setIsExecuting(false);
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
          className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-800/60 bg-gradient-to-r from-amber-500/10 to-transparent">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <AlertOctagon className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                  Deadline Rescue
                </h2>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                  {proposal.reasoning}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proposed Changes</h3>
              
              {proposal.proposedMoves?.map((move: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{move.eventSummary}</p>
                    <p className="text-xs text-slate-500">
                      {move.action === "delete" ? (
                        <span className="text-red-400">Will be removed</span>
                      ) : (
                        <span className="text-amber-400">Move to {new Date(move.proposedNewTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex justify-center py-2">
                <ArrowRight className="w-5 h-5 text-slate-600 rotate-90" />
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-400">
                    {proposal.rescueBlock.summary}
                  </p>
                  <p className="text-xs text-emerald-500/70">
                    {new Date(proposal.rescueBlock.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(proposal.rescueBlock.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 pt-4 border-t border-slate-800 bg-slate-950/50 flex gap-3">
            <button
              onClick={onClose}
              disabled={isExecuting}
              className="flex-1 py-3 px-4 rounded-xl font-medium text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isExecuting}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {isExecuting ? "Executing..." : "Confirm Rescue"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

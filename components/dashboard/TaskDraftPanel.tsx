"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, Copy, Check, Save } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/types";

interface TaskDraftPanelProps {
  task: Task;
  userId: string;
  onClose: () => void;
  onUpdateDraft?: (taskId: string, newContent: string) => void;
}

export default function TaskDraftPanel({ task, userId, onClose, onUpdateDraft }: TaskDraftPanelProps) {
  const [loading, setLoading] = useState(!task.draftContent);
  const [draftContent, setDraftContent] = useState(task.draftContent || "");
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!task.draftContent) {
      generateDraft();
    }
  }, [task.id]);

  const generateDraft = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId, task }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      setDraftContent(json.data.draftContent);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate draft.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Draft copied to clipboard!");
  };

  const handleSave = () => {
    setEditing(false);
    if (onUpdateDraft) {
      onUpdateDraft(task.id!, draftContent);
      toast.success("Draft saved!");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[85vh] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                  AI Draft Generated
                  <span className="badge badge-warning text-[10px] uppercase tracking-wider">Starting Point</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">{task.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-900/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-slate-400 animate-pulse">
                  Drafting Deep Work Execution...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {editing ? (
                  <textarea
                    className="w-full h-[50vh] p-4 bg-slate-950 border border-indigo-500/30 rounded-xl text-slate-200 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                  />
                ) : (
                  <div className="prose prose-invert prose-indigo max-w-none">
                    <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-sm text-slate-300 font-mono whitespace-pre-wrap">
                      {draftContent}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {!loading && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-t border-slate-800/60 bg-slate-900/80 backdrop-blur-md gap-4">
              <p className="text-xs text-slate-500">
                This is a generated starting point. Review and edit before submitting.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                {editing ? (
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium text-sm transition-colors"
                  >
                    <Save className="w-4 h-4" /> Save Edits
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-colors"
                  >
                    Edit
                  </button>
                )}
                
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-indigo-500/20"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Workflow,
  Loader2,
  Trash2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Task, Subtask } from "@/types";

interface TaskCardProps {
  task: Task;
  onPanic: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  onAutoPlan: (task: Task) => void;
}

const priorityConfig = {
  low: { badge: "badge-success", label: "Low", dot: "bg-emerald-500" },
  medium: { badge: "badge-warning", label: "Medium", dot: "bg-amber-500" },
  high: { badge: "badge-destructive", label: "High", dot: "bg-red-500" },
  urgent: { badge: "badge-destructive", label: "Urgent", dot: "bg-red-600" },
};

const statusConfig = {
  pending: { label: "Pending", color: "text-slate-500" },
  "in-progress": { label: "In Progress", color: "text-blue-600" },
  completed: { label: "Completed", color: "text-emerald-600" },
  overdue: { label: "Overdue", color: "text-red-600" },
};

export default function TaskCard({
  task,
  onPanic,
  onDelete,
  onStatusChange,
  onAutoPlan,
}: TaskCardProps) {
  const [isAutoPlanLoading, setIsAutoPlanLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const isCompleted = task.status === "completed";
  const taskSubtasks = task.subtasks || [];

  const handleAutoPlan = async () => {
    setIsAutoPlanLoading(true);
    try {
      await onAutoPlan(task);
    } finally {
      setIsAutoPlanLoading(false);
    }
  };

  const toggleComplete = () => {
    onStatusChange(task.id!, isCompleted ? "pending" : "completed");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`card p-5 transition-all ${
        isCompleted ? "opacity-60" : ""
      } ${task.isPanicActive ? "ring-2 ring-red-300 ring-offset-2" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={toggleComplete}
          className="mt-0.5 flex-shrink-0 group"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 transition-colors" />
          ) : (
            <Circle className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={`text-sm font-semibold leading-snug ${
                  isCompleted
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-light">
                  {task.description}
                </p>
              )}
            </div>

            {/* Priority badge */}
            <span className={`badge text-[10px] flex-shrink-0 ${priority.badge}`}>
              {priority.label}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className={`text-xs font-medium ${status.color}`}>
              {status.label}
            </span>

            {task.deadline && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {task.deadline}
              </span>
            )}

            {taskSubtasks.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
              >
                {taskSubtasks.filter((s) => s.status === "completed").length}/
                {taskSubtasks.length} subtasks
                {expanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {/* Subtasks dropdown */}
          {expanded && taskSubtasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pl-2 border-l-2 border-indigo-100 space-y-2"
            >
              {taskSubtasks.map((subtask, i) => (
                <div key={subtask.id || i} className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      subtask.status === "completed"
                        ? "bg-emerald-400"
                        : "bg-slate-300"
                    }`}
                  />
                  <p
                    className={`text-xs ${
                      subtask.status === "completed"
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {subtask.title}
                  </p>
                  {subtask.estimatedTime && (
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {subtask.estimatedTime}
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-4">
            {/* Auto-Plan */}
            {!isCompleted && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAutoPlan}
                disabled={isAutoPlanLoading}
                className="btn btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
              >
                {isAutoPlanLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Workflow className="w-3 h-3" />
                )}
                Auto-Plan
              </motion.button>
            )}

            {/* Panic Mode */}
            {!isCompleted && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPanic(task)}
                className="btn text-xs px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-sm shadow-red-300/30 hover:shadow-md hover:shadow-red-300/40"
              >
                <AlertTriangle className="w-3 h-3" />
                PANIC
              </motion.button>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Delete */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(task.id!)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

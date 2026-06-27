"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
} from "firebase/firestore";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import BrainDumpInput from "@/components/dashboard/BrainDumpInput";
import TaskCard from "@/components/dashboard/TaskCard";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import PanicModal from "@/components/dashboard/PanicModal";

import type { Task, Subtask, ExtractedTask, PanicSchedule } from "@/types";
import { ListTodo, Inbox, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Panic modal state
  const [panicOpen, setPanicOpen] = useState(false);
  const [panicLoading, setPanicLoading] = useState(false);
  const [panicSchedule, setPanicSchedule] = useState<PanicSchedule | null>(null);

  // ─── Real-time Firestore listeners ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const db = getFirebaseDb();

    // Tasks listener - fetch by uid, sort locally to avoid composite index requirement
    const tasksQuery = query(
      collection(db, "tasks"),
      where("uid", "==", user.uid)
    );

    const unsubTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const taskList: Task[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        
        // Sort locally by createdAt desc
        taskList.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setTasks(taskList);
        setIsLoadingTasks(false);
      },
      (error) => {
        console.error("Tasks listener error:", error);
        setIsLoadingTasks(false);
        // If index not ready yet, just use empty array
        setTasks([]);
      }
    );

    return () => {
      unsubTasks();
    };
  }, [user]);

  // ─── Save extracted tasks to Firestore ────────────────────────────────────
  const handleTasksExtracted = useCallback(
    async (extractedTasks: ExtractedTask[]) => {
      if (!user) return;
      const db = getFirebaseDb();

      try {
        const promises = extractedTasks.map((et) =>
          addDoc(collection(db, "tasks"), {
            uid: user.uid,
            title: et.title,
            description: et.description,
            deadline: et.deadline || "",
            priority: et.priority,
            status: "pending",
            isPanicActive: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        );
        await Promise.all(promises);
      } catch (error) {
        console.error("Error saving tasks:", error);
        toast.error("Failed to save tasks to database.");
      }
    },
    [user]
  );

  // ─── Delete task ──────────────────────────────────────────────────────────
  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!user) return;
      const db = getFirebaseDb();
      try {
        await deleteDoc(doc(db, "tasks", taskId));
        toast.success("Task deleted");
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task.");
      }
    },
    [user]
  );

  // ─── Update task status ───────────────────────────────────────────────────
  const handleStatusChange = useCallback(
    async (taskId: string, status: Task["status"]) => {
      if (!user) return;
      const db = getFirebaseDb();
      try {
        await updateDoc(doc(db, "tasks", taskId), {
          status,
          updatedAt: serverTimestamp(),
        });

        if (status === "completed") {
          // Increment gamification stats
          await updateDoc(doc(db, "users", user.uid), {
            points: increment(10),
            vibeScore: increment(5),
          });
          toast.success("Task completed! 🎉", { description: "+10 Points, +5 Vibe Score" });
        }
      } catch (error) {
        console.error("Error updating task:", error);
        toast.error("Failed to update task.");
      }
    },
    [user]
  );

  // ─── Auto-Plan ────────────────────────────────────────────────────────────
  const handleAutoPlan = useCallback(
    async (task: Task) => {
      if (!user) return;
      const db = getFirebaseDb();

      try {
        const res = await fetch("/api/auto-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        // Save subtasks directly to the parent task
        const newSubtasks: Subtask[] = data.data.subtasks.map(
          (st: Record<string, unknown>) => ({
            id: crypto.randomUUID(),
            title: st.title as string,
            description: (st.description as string) || "",
            status: "pending" as const,
            estimatedTime: (st.estimatedTime as string) || "1 hour",
            scheduledStart: (st.scheduledStart as string) || undefined,
            scheduledEnd: (st.scheduledEnd as string) || undefined,
            createdAt: new Date().toISOString(),
          })
        );

        // Update parent task
        await updateDoc(doc(db, "tasks", task.id!), {
          status: "in-progress",
          subtasks: newSubtasks,
          updatedAt: serverTimestamp(),
        });

        toast.success(
          `Auto-planned ${data.data.subtasks.length} subtasks! 🧠`,
          { description: "Subtasks have been added to your task." }
        );
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(err.message || "Auto-plan failed. Please try again.");
      }
    },
    [user]
  );

  // ─── Panic Mode ───────────────────────────────────────────────────────────
  const handlePanic = useCallback(
    async (task: Task) => {
      setPanicOpen(true);
      setPanicLoading(true);
      setPanicSchedule(null);

      try {
        const res = await fetch("/api/panic-mode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        setPanicSchedule(data.data);

        // Mark task as panic active
        if (user && task.id) {
          const db = getFirebaseDb();
          await updateDoc(doc(db, "tasks", task.id), {
            isPanicActive: true,
            updatedAt: serverTimestamp(),
          });
        }
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(err.message || "Panic mode failed.");
        setPanicOpen(false);
      } finally {
        setPanicLoading(false);
      }
    },
    [user]
  );

  // ─── Computed ─────────────────────────────────────────────────────────────
  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Welcome back,{" "}
            <span className="gradient-text">
              {user?.displayName || user?.email?.split("@")[0] || "User"}
            </span>{" "}
            👋
          </h1>
          <p className="text-muted-foreground font-light mt-1">
            {activeTasks.length === 0
              ? "All clear! Add some tasks to get started."
              : `You have ${activeTasks.length} active task${activeTasks.length > 1 ? "s" : ""}. Let's crush them.`}
          </p>
        </motion.div>

        {/* Brain Dump Input — Full Width Top */}
        <div className="mb-8">
          <BrainDumpInput onTasksExtracted={handleTasksExtracted} />
        </div>

        {/* Main Grid: Tasks (left) + Calendar (right) */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Tasks — 2/3 width */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <ListTodo className="w-4 h-4 text-slate-600" />
              </div>
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                Your Tasks
              </h2>
              {activeTasks.length > 0 && (
                <span className="badge badge-primary">
                  {activeTasks.length}
                </span>
              )}
            </div>

            {/* Task list */}
            {isLoadingTasks ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 skeleton rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 skeleton rounded w-3/4" />
                        <div className="h-3 skeleton rounded w-1/2" />
                        <div className="flex gap-2 mt-3">
                          <div className="h-7 w-20 skeleton rounded-lg" />
                          <div className="h-7 w-16 skeleton rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTasks.length === 0 && completedTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="card p-12 text-center"
              >
                <Inbox className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No tasks yet
                </h3>
                <p className="text-sm text-muted-foreground font-light max-w-sm mx-auto">
                  Use the Brain Dump above to add your first tasks. Type, speak, or
                  upload an image — AI will extract your tasks automatically.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {activeTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onPanic={handlePanic}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                      onAutoPlan={handleAutoPlan}
                    />
                  ))}
                </AnimatePresence>

                {/* Completed tasks */}
                {completedTasks.length > 0 && (
                  <div className="mt-8">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      Completed ({completedTasks.length})
                    </p>
                    <div className="space-y-2">
                      <AnimatePresence mode="popLayout">
                        {completedTasks.slice(0, 5).map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            onPanic={handlePanic}
                            onDelete={handleDeleteTask}
                            onStatusChange={handleStatusChange}
                            onAutoPlan={handleAutoPlan}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Calendar Widget — 1/3 width */}
          <div className="lg:col-span-1">
            <CalendarWidget />
          </div>
        </div>
      </main>

      {/* Panic Mode Modal */}
      <PanicModal
        isOpen={panicOpen}
        onClose={() => setPanicOpen(false)}
        schedule={panicSchedule}
        isLoading={panicLoading}
      />
    </>
  );
}

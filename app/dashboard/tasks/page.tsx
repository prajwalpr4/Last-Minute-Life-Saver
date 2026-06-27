"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb } from "@/lib/firebase";
import {
  collection,
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

import TaskCard from "@/components/dashboard/TaskCard";
import PanicModal from "@/components/dashboard/PanicModal";
import type { Task, Subtask, PanicSchedule } from "@/types";
import { ListTodo, Inbox, Sparkles } from "lucide-react";

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  // Panic modal state
  const [panicOpen, setPanicOpen] = useState(false);
  const [panicLoading, setPanicLoading] = useState(false);
  const [panicSchedule, setPanicSchedule] = useState<PanicSchedule | null>(null);

  // Real-time Firestore listeners
  useEffect(() => {
    if (!user) return;
    const db = getFirebaseDb();
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
        taskList.sort((a, b) => {
          const timeA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : 0;
          const timeB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : 0;
          return timeB - timeA;
        });
        
        setTasks(taskList);
        setIsLoadingTasks(false);
      },
      (error) => {
        console.error("Tasks listener error:", error);
        setIsLoadingTasks(false);
        setTasks([]);
      }
    );
    return () => unsubTasks();
  }, [user]);

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

        await updateDoc(doc(db, "tasks", task.id!), {
          status: "in-progress",
          subtasks: newSubtasks,
          updatedAt: serverTimestamp(),
        });
        toast.success(`Auto-planned ${data.data.subtasks.length} subtasks! 🧠`);
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(err.message || "Auto-plan failed.");
      }
    },
    [user]
  );

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

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            All Tasks
          </h1>
          {activeTasks.length > 0 && (
            <span className="badge badge-primary ml-auto">
              {activeTasks.length} Active
            </span>
          )}
        </div>

        {isLoadingTasks ? (
          <div className="space-y-4">
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
              No tasks found
            </h3>
            <p className="text-sm text-muted-foreground font-light max-w-sm mx-auto">
              Go to the Dashboard and use the Brain Dump to add your first tasks.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
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

            {completedTasks.length > 0 && (
              <div className="mt-12">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Completed ({completedTasks.length})
                </p>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {completedTasks.map((task) => (
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
      </main>

      <PanicModal
        isOpen={panicOpen}
        onClose={() => setPanicOpen(false)}
        schedule={panicSchedule}
        isLoading={panicLoading}
      />
    </>
  );
}

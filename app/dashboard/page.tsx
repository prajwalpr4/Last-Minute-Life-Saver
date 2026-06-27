"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getAuth } from "firebase/auth";
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
  getDoc,
  setDoc,
  getDocs,
} from "firebase/firestore";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import BrainDumpInput from "@/components/dashboard/BrainDumpInput";
import TaskCard from "@/components/dashboard/TaskCard";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import PanicModal from "@/components/dashboard/PanicModal";
import TaskDraftPanel from "@/components/dashboard/TaskDraftPanel";
import RescueModal from "@/components/dashboard/RescueModal";
import VoiceCommandCenter from "@/components/dashboard/VoiceCommandCenter";
import WhatIfSimulator from "@/components/dashboard/WhatIfSimulator";

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

  // Draft state
  const [draftTask, setDraftTask] = useState<Task | null>(null);

  // Rescue state
  const [rescueProposal, setRescueProposal] = useState<any>(null);
  const checkedTasksRef = useRef<Set<string>>(new Set());

  // Simulator state
  const [simulatorOpen, setSimulatorOpen] = useState(false);

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
        
        // Sort locally by createdAt desc (handle pending server timestamps)
        taskList.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
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
            title: et.title || "Untitled Task",
            description: et.description || "",
            deadline: et.deadline || "",
            priority: et.priority || "medium",
            status: "pending",
            isPanicActive: false,
            reason: et.reason || null,
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

  const handleUpdateDraft = useCallback(
    async (taskId: string, newContent: string) => {
      if (!user) return;
      const db = getFirebaseDb();
      try {
        await updateDoc(doc(db, "tasks", taskId), {
          draftContent: newContent,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating draft:", error);
        toast.error("Failed to save draft edits.");
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

  // ─── Predictive Deadline Rescue ──────────────────────────────────────────
  useEffect(() => {
    if (!user || tasks.length === 0 || rescueProposal) return;

    const checkAtRiskTasks = async () => {
      for (const task of tasks) {
        if (task.status === "completed" || !task.deadline || checkedTasksRef.current.has(task.id!)) continue;

        const deadlineDate = new Date(task.deadline);
        const now = new Date();
        if (deadlineDate < now) continue; // Already overdue

        const hoursRemaining = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Sum estimated time of pending subtasks (naive parse)
        let estimatedHoursNeeded = 0;
        const pendingSubtasks = task.subtasks?.filter(s => s.status !== "completed") || [];
        for (const st of pendingSubtasks) {
          const lower = st.estimatedTime.toLowerCase();
          if (lower.includes("hour")) {
            const num = parseFloat(lower) || 1;
            estimatedHoursNeeded += num;
          } else if (lower.includes("min")) {
            const num = parseFloat(lower) || 30;
            estimatedHoursNeeded += num / 60;
          } else {
            estimatedHoursNeeded += 1; // Default 1 hour fallback
          }
        }

        // If math doesn't fit (e.g. 5 hours of work, 3 hours left before deadline)
        if (estimatedHoursNeeded > 0 && estimatedHoursNeeded > hoursRemaining) {
          checkedTasksRef.current.add(task.id!);
          
          try {
            // Fetch token
            const db = getFirebaseDb();
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const googleToken = userDoc.data()?.googleAccessToken;
            
            if (googleToken) {
              const res = await fetch("/api/rescue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid: user.uid, task, googleToken }),
              });
              const json = await res.json();
              if (json.success && json.data) {
                setRescueProposal({ ...json.data, taskId: task.id });
                break; // Only rescue one at a time to avoid modal spam
              }
            }
          } catch (e) {
            console.error("Failed to check rescue:", e);
          }
        }
      }
    };

    const timeout = setTimeout(checkAtRiskTasks, 3000); // Debounce
    return () => clearTimeout(timeout);
  }, [tasks, user, rescueProposal]);

  // ─── Computed ─────────────────────────────────────────────────────────────
  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const handleRefreshProfile = async () => {
    if (!user) return;
    try {
      const db = getFirebaseDb();
      // 1. Seed fake data if empty
      const eventsRef = collection(db, "task_events");
      const q = query(eventsRef, where("ownerId", "==", user.uid));
      const snapshot = await getDocs(q);
      
      let events: any[] = [];
      if (snapshot.empty) {
        toast("Seeding fake task history for demo...");
        const fakeEvents = [
          { ownerId: user.uid, taskId: 't1', eventType: 'completed', taskCategory: 'email', timestamp: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
          { ownerId: user.uid, taskId: 't2', eventType: 'panic_mode_triggered', taskCategory: 'coding', timestamp: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
          { ownerId: user.uid, taskId: 't3', eventType: 'delayed', taskCategory: 'coding', timestamp: new Date(Date.now() - 4*24*60*60*1000).toISOString() },
          { ownerId: user.uid, taskId: 't4', eventType: 'completed', taskCategory: 'writing', timestamp: new Date(Date.now() - 1*24*60*60*1000).toISOString() },
          { ownerId: user.uid, taskId: 't5', eventType: 'delayed', taskCategory: 'coding', timestamp: new Date(Date.now() - 5*24*60*60*1000).toISOString() }
        ];
        for (const ev of fakeEvents) {
          const newDoc = doc(eventsRef);
          await setDoc(newDoc, ev);
          events.push(ev);
        }
      } else {
        events = snapshot.docs.map(d => d.data());
      }

      toast("Analyzing behavioral profile...");
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, events })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      await updateDoc(doc(db, "users", user.uid), {
        productivity_profile: json.data
      });
      toast.success("Productivity profile refreshed!");
    } catch (e: any) {
      toast.error(e.message || "Failed to refresh profile");
    }
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome header & Simulator Action */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
              Welcome back,{" "}
              <span className="gradient-text">
                {user?.displayName || user?.email?.split("@")[0] || "User"}
              </span>{" "}
              👋
              {(user as any)?.productivity_profile && (
                <button onClick={handleRefreshProfile} className="text-xs px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md hover:bg-indigo-500/20 transition-colors">
                  Refresh Profile
                </button>
              )}
            </h1>
            <p className="text-muted-foreground font-light mt-1">
              {activeTasks.length === 0
                ? "All clear! Add some tasks to get started."
                : `You have ${activeTasks.length} active task${activeTasks.length > 1 ? "s" : ""}. Let's crush them.`}
              {!(user as any)?.productivity_profile && (
                <button onClick={handleRefreshProfile} className="ml-2 text-indigo-400 hover:underline">Generate Productivity Profile</button>
              )}
            </p>
          </div>
          <button
            onClick={() => setSimulatorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-xl font-medium text-sm transition-colors border border-indigo-500/20 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            What-If Simulator
          </button>
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
                <AnimatePresence>
                  {activeTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onPanic={handlePanic}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                      onAutoPlan={handleAutoPlan}
                      onStartTask={setDraftTask}
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
                      <AnimatePresence>
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
            <CalendarWidget tasks={tasks} />
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

      {/* Draft Panel */}
      {draftTask && (
        <TaskDraftPanel
          task={draftTask}
          userId={user?.uid || ""}
          onClose={() => setDraftTask(null)}
          onUpdateDraft={handleUpdateDraft}
        />
      )}

      {/* Rescue Modal */}
      <RescueModal
        isOpen={!!rescueProposal}
        proposal={rescueProposal}
        onClose={() => setRescueProposal(null)}
        onConfirm={async () => {
          // Send request to execute rescue
          if (!rescueProposal || !user) return;
          const db = getFirebaseDb();
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const googleToken = userDoc.data()?.googleAccessToken;
          
          if (!googleToken) throw new Error("No Google token found");

          const res = await fetch("/api/calendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              token: googleToken, 
              rescueMode: true,
              proposal: rescueProposal 
            }),
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.error);
        }}
      />

      <VoiceCommandCenter userId={user?.uid || ""} />

      <WhatIfSimulator
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        userId={user?.uid || ""}
        tasks={tasks}
        googleToken={user?.googleCalendarConnected ? (user as any).googleAccessToken : undefined}
      />
    </>
  );
}

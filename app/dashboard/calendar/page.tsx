"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import type { Task } from "@/types";

export default function CalendarPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

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
          const timeA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : Date.now();
          const timeB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : Date.now();
          return timeB - timeA;
        });

        setTasks(taskList);
        setIsLoading(false);
      },
      (error) => {
        console.error("Tasks listener error:", error);
        setIsLoading(false);
        setTasks([]);
      }
    );

    return () => unsubTasks();
  }, [user]);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarIcon className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Your Calendar
        </h1>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <CalendarWidget tasks={tasks} />
      </motion.div>
    </main>
  );
}

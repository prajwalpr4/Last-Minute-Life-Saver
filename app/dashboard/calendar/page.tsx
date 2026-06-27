"use client";

import { motion } from "framer-motion";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarIcon className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Your Calendar
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <CalendarWidget />
      </motion.div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Circle,
  CheckCircle2,
} from "lucide-react";
import type { Task } from "@/types";

interface CalendarWidgetProps {
  tasks?: Task[];
}

const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days: Date[] = [];
  const startDay = date.getDay(); // 0 is Sunday
  
  // Pad beginning with previous month days
  for (let i = startDay; i > 0; i--) {
    days.push(new Date(year, month, 1 - i));
  }
  
  // Current month
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  
  // Pad end to complete 42 cells (6 weeks)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export default function CalendarWidget({ tasks = [] }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = getDaysInMonth(year, month);
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getTaskDate = (task: Task) => {
    try {
      if (task.deadline) return new Date(task.deadline);
      const created = task.createdAt as any;
      if (!created) return new Date();
      if (created?.toMillis) return new Date(created.toMillis());
      return new Date(created);
    } catch {
      return new Date();
    }
  };

  // Find tasks for the selected date
  const selectedTasks = tasks.filter((t) => isSameDay(getTaskDate(t), selectedDate));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card-elevated p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Calendar
            </h2>
            <p className="text-xs text-muted-foreground">Task Timeline</p>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = day.getMonth() === month;
          const isTodayDate = isSameDay(day, new Date());
          const hasTasks = tasks.some((t) => isSameDay(getTaskDate(t), day) && t.status !== "completed");
          const hasCompletedTasks = tasks.some((t) => isSameDay(getTaskDate(t), day) && t.status === "completed");

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`
                relative min-h-[44px] sm:h-9 rounded-md flex items-center justify-center text-sm transition-colors
                ${isSelected ? "bg-primary text-primary-foreground font-semibold shadow-sm" : "hover:bg-muted"}
                ${!isCurrentMonth ? "text-muted-foreground/30" : isSelected ? "" : "text-foreground"}
                ${isTodayDate && !isSelected ? "text-primary font-bold bg-primary/5" : ""}
              `}
            >
              {day.getDate()}
              
              {/* Task Indicators */}
              <div className="absolute bottom-1.5 flex gap-1">
                {hasTasks && <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-red-400"}`} />}
                {hasCompletedTasks && !hasTasks && <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/70" : "bg-emerald-400"}`} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Date Tasks */}
      <div className="flex-1 border-t border-border pt-4 flex flex-col min-h-[150px]">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {isSameDay(selectedDate, new Date()) 
            ? "Today's Tasks" 
            : selectedDate.toLocaleDateString("en-US", { weekday: 'long', month: "short", day: "numeric" })}
        </h3>
        
        {selectedTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
            <p className="text-xs">No tasks scheduled.</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
            {selectedTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/60 transition-colors">
                {task.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-tight ${task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                    {task.title}
                  </p>
                  {task.priority && (
                     <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider block">
                       {task.priority} Priority
                     </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

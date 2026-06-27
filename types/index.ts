// types/index.ts
// Shared TypeScript interfaces for all data models

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profilePicUrl?: string;
  googleCalendarConnected: boolean;
  points: number;
  streak: number;
  vibeScore: number;
  lastActiveDate?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// ─── Task ────────────────────────────────────────────────────────────────────
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";

export interface Task {
  id?: string;
  uid: string;
  title: string;
  description: string;
  deadline?: string;
  priority: TaskPriority;
  status: TaskStatus;
  isPanicActive: boolean;
  subtasks?: Subtask[];
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// ─── Subtask ─────────────────────────────────────────────────────────────────
export type SubtaskStatus = "pending" | "in-progress" | "completed";

export interface Subtask {
  id?: string;
  title: string;
  description?: string;
  status: SubtaskStatus;
  estimatedTime: string; // e.g., "2 hours", "30 minutes"
  scheduledStart?: string;
  scheduledEnd?: string;
  calendarEventId?: string;
  createdAt: Date | string;
}

// ─── Brain Dump (AI extraction result) ───────────────────────────────────────
export interface ExtractedTask {
  title: string;
  description: string;
  priority: TaskPriority;
  deadline?: string;
}

// ─── Panic Mode Schedule ─────────────────────────────────────────────────────
export interface PanicStep {
  time: string; // e.g., "0:00 - 0:15"
  action: string;
  details: string;
}

export interface PanicSchedule {
  taskTitle: string;
  totalTime: string;
  steps: PanicStep[];
  tips: string[];
}

// ─── Google Calendar Event ───────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  link?: string;
  colorId?: string;
}

// ─── API Response Envelope ───────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

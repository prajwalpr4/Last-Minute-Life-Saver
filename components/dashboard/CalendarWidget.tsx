"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  CalendarDays,
  ExternalLink,
  Clock,
  RefreshCw,
  Loader2,
  CalendarPlus,
} from "lucide-react";
import type { CalendarEvent } from "@/types";

export default function CalendarWidget() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/calendar?uid=${user.uid}`);
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to load calendar");
        setEvents([]);
        return;
      }

      setEvents(data.data || []);
    } catch {
      setError("Could not connect to calendar");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      fetchEvents();
      toast.success("Google Calendar connected successfully! 📅");
    }, 1500);
  };

  useEffect(() => {
    // Just stop loading initially. We wait for user to click connect.
    setIsLoading(false);
  }, [user]);

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === today.toDateString()) return "Today";
      if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const eventColors = [
    "bg-indigo-500",
    "bg-blue-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-purple-500",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card-elevated p-6 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              Schedule
            </h2>
            <p className="text-xs text-muted-foreground">
              Upcoming events
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={fetchEvents}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </motion.button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-1 h-12 skeleton rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 skeleton rounded w-3/4" />
                <div className="h-3 skeleton rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : !isConnected ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <CalendarPlus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Connect Calendar</h3>
          <p className="text-xs text-muted-foreground/80 mb-6 max-w-[200px] mx-auto">
            Sync your Google Calendar to auto-schedule tasks and avoid conflicts.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn btn-primary text-xs px-5 py-2 w-full max-w-[200px]"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "Connect with Google"
            )}
          </motion.button>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8">
          <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No upcoming events</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Your calendar is clear! 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 5).map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-3 items-start group p-2.5 rounded-xl hover:bg-muted transition-colors"
            >
              {/* Color bar */}
              <div
                className={`w-1 h-full min-h-[2.5rem] rounded-full ${
                  eventColors[i % eventColors.length]
                } flex-shrink-0`}
              />

              {/* Event info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug truncate">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(event.start)} · {formatTime(event.start)} –{" "}
                    {formatTime(event.end)}
                  </span>
                </div>
              </div>

              {/* External link */}
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

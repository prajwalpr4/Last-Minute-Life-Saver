"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  ListTodo,
  CalendarSync,
  Siren,
  Mic,
  ImagePlus,
  Workflow,
  Clock,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  accentIcon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  delay: number;
}

function FeatureCard({
  icon,
  accentIcon,
  title,
  description,
  gradient,
  iconBg,
  delay,
}: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="card p-8 h-full group cursor-default relative overflow-hidden"
      >
        {/* Subtle gradient background on hover */}
        <div
          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`}
        />

        <div className="relative z-10">
          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground font-light leading-relaxed text-[0.95rem]">
            {description}
          </p>

          {/* Accent detail */}
          <div className="flex items-center gap-2 mt-6 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {accentIcon}
            <span>Learn more</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const features = [
  {
    icon: <Brain className="w-7 h-7 text-indigo-600" />,
    accentIcon: <Mic className="w-4 h-4" />,
    title: "Multimodal Brain Dump",
    description:
      "Dump your messy thoughts via text, voice, or photo. Our AI extracts clean, actionable tasks from even the most chaotic input — a photo of your whiteboard, a voice ramble, anything.",
    gradient: "bg-gradient-to-br from-indigo-50/80 to-transparent",
    iconBg: "bg-indigo-100",
    delay: 0.1,
  },
  {
    icon: <ListTodo className="w-7 h-7 text-blue-600" />,
    accentIcon: <Workflow className="w-4 h-4" />,
    title: "Auto-Plan & Breakdown",
    description:
      'Got "Final Year Project" on your list? Hit Auto-Plan and watch Gemini AI break it into subtasks, estimate times, and push them straight to your calendar. Zero manual work.',
    gradient: "bg-gradient-to-br from-blue-50/80 to-transparent",
    iconBg: "bg-blue-100",
    delay: 0.2,
  },
  {
    icon: <CalendarSync className="w-7 h-7 text-cyan-600" />,
    accentIcon: <Clock className="w-4 h-4" />,
    title: "Google Calendar Sync",
    description:
      "Seamlessly connected to your Google Calendar. AI-scheduled tasks appear as real calendar events. See your day at a glance right from the dashboard.",
    gradient: "bg-gradient-to-br from-cyan-50/80 to-transparent",
    iconBg: "bg-cyan-100",
    delay: 0.3,
  },
  {
    icon: <Siren className="w-7 h-7 text-red-600" />,
    accentIcon: <ImagePlus className="w-4 h-4" />,
    title: "Panic Mode 🚨",
    description:
      "The ultimate procrastinator bailout. Hit the panic button and get a hyper-compressed, minute-by-minute survival schedule to power through your task in the next 3 hours.",
    gradient: "bg-gradient-to-br from-red-50/80 to-transparent",
    iconBg: "bg-red-100",
    delay: 0.4,
  },
];

export default function FeaturesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative py-32 px-6">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              isHeaderInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6 }}
            className="badge badge-primary px-4 py-1.5 mb-6 text-sm"
          >
            ✨ Core Capabilities
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={
              isHeaderInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
          >
            Your AI{" "}
            <span className="gradient-text">Productivity</span>{" "}
            Engine
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={
              isHeaderInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
            }
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground font-light leading-relaxed"
          >
            Four powerful features that transform chaotic to-do lists into
            executed plans — automatically.
          </motion.p>
        </div>

        {/* Feature cards grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

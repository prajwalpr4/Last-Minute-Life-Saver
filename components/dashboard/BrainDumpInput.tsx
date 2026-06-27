"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  Brain,
  Mic,
  MicOff,
  ImagePlus,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import type { ExtractedTask } from "@/types";

interface BrainDumpInputProps {
  onTasksExtracted: (tasks: ExtractedTask[]) => void;
}

export default function BrainDumpInput({ onTasksExtracted }: BrainDumpInputProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // ─── Voice Recording (Web Speech API) ──────────────────────────────────────
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText((prev) => {
        // Replace any previous voice text after the marker
        const marker = "\n🎤 ";
        const markerIndex = prev.indexOf(marker);
        if (markerIndex >= 0) {
          return prev.slice(0, markerIndex) + marker + transcript;
        }
        return prev + (prev ? marker : "🎤 ") + transcript;
      });
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        toast.error(`Voice recognition error: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    toast.info("Listening... Speak your tasks!");
  };

  // ─── Image Upload ──────────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Submit to AI ──────────────────────────────────────────────────────────
  const handleExtract = async () => {
    if (!text.trim() && !imageFile) {
      toast.error("Please enter some text or upload an image first.");
      return;
    }

    setIsProcessing(true);
    setCurrentStep("Initializing Agent...");
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("uid", user?.uid || "");
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/brain-dump", {
        method: "POST",
        body: formData,
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the incomplete line in the buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.step === "Error") {
              throw new Error(parsed.data || "Unknown error occurred");
            } else if (parsed.step === "Done") {
              const tasks: ExtractedTask[] = parsed.data;
              onTasksExtracted(tasks);
              setText("");
              removeImage();
              toast.success(`Extracted ${tasks.length} task${tasks.length > 1 ? "s" : ""}! 🧠`);
            } else {
              setCurrentStep(parsed.step);
            }
          } catch (e) {
            console.error("Failed to parse stream chunk:", line, e);
          }
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Failed to process. Please try again.");
    } finally {
      setIsProcessing(false);
      setCurrentStep(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-elevated p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Brain className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Brain Dump
          </h2>
          <p className="text-xs text-muted-foreground">
            Text, voice, or image — dump it all
          </p>
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Dump your messy thoughts here... e.g., 'need to finish CS assignment by Friday, call dentist, buy groceries, also my FYP proposal is due next month'"
          className="textarea min-h-[140px] pr-4"
          disabled={isProcessing}
        />

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-medium text-red-600">
                Listening...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-32 h-32 object-cover rounded-xl border border-slate-200 shadow-sm"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 right-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-0.5 text-center">
                <p className="text-[10px] text-white font-medium truncate">
                  {imageFile?.name}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agentic Chain Progress UI */}
      <AnimatePresence>
        {isProcessing && currentStep && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  AI is thinking...
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {currentStep}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {/* Voice */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`btn text-sm px-4 py-2 ${
            isRecording
              ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
              : "btn-secondary"
          }`}
        >
          {isRecording ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
          {isRecording ? "Stop" : "Voice"}
        </motion.button>

        {/* Image */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="btn btn-secondary text-sm px-4 py-2"
        >
          <ImagePlus className="w-4 h-4" />
          Image
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Extract */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExtract}
          disabled={isProcessing || (!text.trim() && !imageFile)}
          className="btn btn-primary text-sm px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Extract Tasks
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

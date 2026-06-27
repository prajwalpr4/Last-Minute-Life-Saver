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
  FileText,
  Sparkles,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Check,
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
  const [stepHistory, setStepHistory] = useState<string[]>([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<ExtractedTask[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
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

  // ─── File Upload ──────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/") && selectedFile.type !== "application/pdf") {
      toast.error("Please upload an image or PDF file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB.");
      return;
    }

    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null); // No preview for PDF
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Submit to AI ──────────────────────────────────────────────────────────
  const handleExtract = async () => {
    if (!text.trim() && !file) {
      toast.error("Please enter some text or upload a file first.");
      return;
    }

    setIsProcessing(true);
    setCurrentStep("Initializing Agent...");
    setStepHistory([]);
    setShowReasoning(false);
    try {
      const formData = new FormData();
      formData.append("text", text);
      formData.append("uid", user?.uid || "");
      if (file) {
        formData.append("file", file);
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
          let parsed;
          try {
            parsed = JSON.parse(line);
          } catch (e) {
            console.error("Failed to parse stream chunk:", line, e);
            continue;
          }

          if (parsed.step === "Error") {
            let errorMsg = parsed.data || "Unknown error occurred";
            if (errorMsg.includes("429 Too Many Requests") || errorMsg.includes("Quota exceeded")) {
              errorMsg = "AI rate limit reached. Please wait 60 seconds and try again.";
            } else if (errorMsg.length > 150) {
              errorMsg = errorMsg.substring(0, 150) + "...";
            }
            toast.error(errorMsg);
            // Break out of the loop and let the finally block clean up state
            break;
          } else if (parsed.step === "Done") {
            const tasks: ExtractedTask[] = parsed.data;
            setPendingTasks(tasks);
            toast.success(`Found ${tasks.length} task${tasks.length > 1 ? "s" : ""}! 🧠`);
          } else {
            setCurrentStep(parsed.step);
            setStepHistory((prev) => [...prev, parsed.step]);
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

  const confirmTasks = () => {
    onTasksExtracted(pendingTasks);
    setText("");
    removeFile();
    setPendingTasks([]);
    setStepHistory([]);
    setCurrentStep(null);
    setShowReasoning(false);
  };

  const cancelTasks = () => {
    setPendingTasks([]);
    setStepHistory([]);
    setCurrentStep(null);
    setShowReasoning(false);
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
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Brain className="w-5 h-5 text-indigo-500" />
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
              className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20"
            >
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-xs font-medium text-destructive">
                Listening...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File Preview */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <div className="relative inline-block">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Upload preview"
                  className="w-32 h-32 object-cover rounded-xl border border-border shadow-sm"
                />
              ) : (
                <div className="w-32 h-32 flex flex-col items-center justify-center bg-slate-100 rounded-xl border border-border shadow-sm text-slate-500">
                  <FileText className="w-8 h-8 mb-2 text-indigo-400" />
                  <span className="text-xs font-medium text-center px-2 truncate w-full">
                    {file.name}
                  </span>
                </div>
              )}
              <button
                onClick={removeFile}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
              {filePreview && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-0.5 text-center">
                  <p className="text-[10px] text-white font-medium truncate">
                    {file.name}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agentic Chain Progress UI & Confirmation */}
      <AnimatePresence>
        {pendingTasks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Found {pendingTasks.length} task{pendingTasks.length > 1 ? "s" : ""}!
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Would you like to add them to your dashboard?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={confirmTasks}
                  className="btn btn-primary text-xs px-4 py-2 flex-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Add All Tasks
                </button>
                <button
                  onClick={cancelTasks}
                  className="btn btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          isProcessing && currentStep && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      AI is thinking...
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
                      {currentStep}
                    </p>
                  </div>
                  {stepHistory.length > 0 && (
                    <button
                      onClick={() => setShowReasoning(!showReasoning)}
                      className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 flex-shrink-0"
                    >
                      {showReasoning ? "Hide Reasoning" : "Show Reasoning"}
                      {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>
                
                {/* Reasoning Trace History */}
                <AnimatePresence>
                  {showReasoning && stepHistory.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pl-9 space-y-1.5"
                    >
                      {stepHistory.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-emerald-500" />
                          {step}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
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
              ? "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
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

        {/* Image / Document */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || pendingTasks.length > 0}
          className="btn btn-secondary text-sm px-4 py-2"
        >
          <ImagePlus className="w-4 h-4" />
          Image
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || pendingTasks.length > 0}
          className="btn btn-secondary text-sm px-4 py-2"
        >
          <FileText className="w-4 h-4" />
          Document
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Extract */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExtract}
          disabled={isProcessing || (!text.trim() && !file) || pendingTasks.length > 0}
          className="btn btn-primary text-sm px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto mt-2 sm:mt-0"
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

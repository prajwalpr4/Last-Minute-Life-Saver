"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, X } from "lucide-react";

interface VoiceCommandCenterProps {
  userId: string;
}

export default function VoiceCommandCenter({ userId }: VoiceCommandCenterProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [logs, setLogs] = useState<{ action: string; detail: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // If stopped naturally, process it
          processCommand();
        }
      };
    }
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      processCommand();
    } else {
      setTranscript("");
      setLogs([]);
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const processCommand = async () => {
    if (!transcript.trim()) {
      setIsListening(false);
      return;
    }
    
    setIsListening(false);
    setIsProcessing(true);
    setLogs([{ action: "Command", detail: `"${transcript}"` }]);

    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId, transcript }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            setLogs((prev) => [...prev, parsed]);
          } catch (e) {}
        }
      }
    } catch (error) {
      setLogs((prev) => [...prev, { action: "Error", detail: "Failed to process command." }]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setLogs([]);
        setTranscript("");
      }, 5000); // Clear after 5 seconds
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      
      {/* Reasoning Trace Feed */}
      <AnimatePresence>
        {(transcript || logs.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl pointer-events-auto flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agentic Command Center</h3>
              {isProcessing && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
            </div>
            
            {transcript && (
              <p className="text-sm font-medium text-slate-200 italic">"{transcript}"</p>
            )}

            <div className="space-y-2 mt-2">
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-xs p-2 rounded-lg border ${
                    log.action === "Error"
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : log.action === "Success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-indigo-500/10 border-indigo-500/20 text-indigo-300"
                  }`}
                >
                  <span className="font-semibold">{log.action}:</span> {log.detail}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mic Button */}
      <div className="relative pointer-events-auto">
        {/* Pulse Ring */}
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
        )}
        
        <button
          onClick={toggleListening}
          className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all ${
            isListening
              ? "bg-red-500 text-white shadow-red-500/40"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>
    </div>
  );
}

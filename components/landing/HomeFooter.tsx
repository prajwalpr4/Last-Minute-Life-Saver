"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export default function HomeFooter() {
  return (
    <footer className="py-12 border-t border-slate-200/60" style={{ backgroundColor: "#FAFAF7" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#4C3FE0" }}
            >
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-semibold tracking-tight" style={{ color: "#1a1a2e" }}>
              LastMin<span style={{ color: "#4C3FE0" }}>Saver</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/login" className="hover:text-slate-600 transition-colors">
              Sign In
            </Link>
            <a href="#features" className="hover:text-slate-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-slate-600 transition-colors">
              How It Works
            </a>
          </div>

          {/* Credit */}
          <p className="text-xs text-slate-400">
            Developed by <span className="font-semibold text-slate-500">Prajwal P Raikar</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

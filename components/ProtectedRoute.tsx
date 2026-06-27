"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Loading state — elegant full-screen loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-5"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25"
          >
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </motion.div>
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium text-foreground">Loading...</p>
            <p className="text-xs text-muted-foreground">
              Checking authentication
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Not authenticated — will redirect via useEffect
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

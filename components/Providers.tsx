"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/auth-context";
import ToastProvider from "@/components/ToastProvider";
import PageTransition from "@/components/PageTransition";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      <AuthProvider>
        <ToastProvider />
        <PageTransition>{children}</PageTransition>
      </AuthProvider>
    </ThemeProvider>
  );
}

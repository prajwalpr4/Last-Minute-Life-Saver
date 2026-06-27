"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          borderRadius: "0.75rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px -3px rgba(148, 163, 184, 0.15)",
        },
        classNames: {
          success: "!bg-emerald-50 !text-emerald-800 !border-emerald-200",
          error: "!bg-red-50 !text-red-800 !border-red-200",
          warning: "!bg-amber-50 !text-amber-800 !border-amber-200",
          info: "!bg-blue-50 !text-blue-800 !border-blue-200",
        },
      }}
      richColors
      closeButton
    />
  );
}

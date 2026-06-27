import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "The Last-Minute Life Saver — AI Productivity Agent",
    template: "%s | Last-Minute Life Saver",
  },
  description:
    "An AI-powered productivity agent that autonomously plans, schedules, and executes tasks for you. Never miss a deadline again.",
  keywords: [
    "AI productivity",
    "task management",
    "autonomous agent",
    "Google Gemini",
    "last minute",
    "deadline",
    "scheduler",
  ],
  openGraph: {
    title: "The Last-Minute Life Saver",
    description:
      "AI-powered productivity agent that goes beyond passive reminders to autonomously plan, schedule, and execute your tasks.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

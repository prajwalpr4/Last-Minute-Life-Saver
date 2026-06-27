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

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__FIREBASE_CONFIG__ = {
                apiKey: ${JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "")},
                authDomain: ${JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "")},
                projectId: ${JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "")},
                storageBucket: ${JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "")},
                messagingSenderId: ${JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "")},
                appId: ${JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "")},
                measurementId: ${JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "")}
              };
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

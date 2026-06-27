import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task } = body;

    if (!task || !task.title) {
      return Response.json(
        { success: false, error: "Task details required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { success: false, error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const prompt = `You are an emergency productivity AI. The user is PANICKING because they procrastinated.

Task: "${task.title}"
Description: "${task.description || "No description"}"
Priority: ${task.priority || "high"}
Current Time: ${currentTime}

THE USER NEEDS A HYPER-COMPRESSED SURVIVAL SCHEDULE FOR THE NEXT 1 TO 3 HOURS.

Rules:
- Be direct, no fluff, no motivational speeches
- Break the time down into rigorous, minute-by-minute blocks (e.g. 14:00 - 14:15, 14:15 - 14:22). Every single minute must be accounted for.
- There should be absolutely no slack. If a task takes 7 minutes, schedule exactly 7 minutes.
- Each step should be immediately actionable
- Include short micro-breaks (2 min max) if needed
- Return ONLY valid JSON (no markdown, no code fences)

JSON format:
{
  "taskTitle": "task name",
  "totalTime": "3 hours",
  "steps": [
    {
      "time": "0:00 - 0:15",
      "action": "What to do (concise)",
      "details": "Specific instructions (1 sentence)"
    }
  ],
  "tips": [
    "Survival tip 1",
    "Survival tip 2"
  ]
}

Generate 8-12 steps. Make it intense but doable. Return ONLY the JSON:`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Parse JSON
    const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      responseText = match[1].trim();
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
    }

    const schedule = JSON.parse(responseText);

    // Sanitize
    const sanitized = {
      taskTitle: String(schedule.taskTitle || task.title),
      totalTime: String(schedule.totalTime || "3 hours"),
      steps: (schedule.steps || []).map((s: Record<string, unknown>) => ({
        time: String(s.time || ""),
        action: String(s.action || ""),
        details: String(s.details || ""),
      })),
      tips: (schedule.tips || []).map((t: unknown) => String(t)),
    };

    return Response.json({ success: true, data: sanitized });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Panic mode API error:", err);
    return Response.json(
      { success: false, error: err.message || "Failed to generate panic schedule" },
      { status: 500 }
    );
  }
}

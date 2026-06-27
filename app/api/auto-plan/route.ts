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

    const prompt = `You are a productivity AI that breaks down large tasks into actionable subtasks.

Task: "${task.title}"
Description: "${task.description || "No description"}"
Priority: ${task.priority || "medium"}
${task.deadline ? `Deadline: ${task.deadline}` : ""}

Instructions:
- Break this into 4-6 manageable subtasks
- Estimate time for each subtask (be realistic)
- Order subtasks logically (dependencies first)
- Return ONLY a valid JSON object (no markdown, no code fences)

JSON format:
{
  "subtasks": [
    {
      "title": "Subtask name",
      "description": "Brief description of what to do",
      "estimatedTime": "2 hours",
      "scheduledStart": "ISO datetime suggestion",
      "scheduledEnd": "ISO datetime suggestion"
    }
  ],
  "calendarEvents": [
    {
      "title": "Focus: Subtask name",
      "description": "Working on: brief description",
      "startTime": "ISO datetime",
      "endTime": "ISO datetime"
    }
  ]
}

For scheduling, use today's date (${new Date().toISOString().split("T")[0]}) and spread subtasks across reasonable work hours (9 AM - 9 PM). Return ONLY the JSON:`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text().trim();

    // Parse JSON
    const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      responseText = match[1].trim();
    } else if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
    }

    const parsed = JSON.parse(responseText);

    // Sanitize subtasks
    const subtasks = (parsed.subtasks || []).map(
      (st: Record<string, unknown>) => ({
        title: String(st.title || "Subtask"),
        description: String(st.description || ""),
        estimatedTime: String(st.estimatedTime || "1 hour"),
        status: "pending",
        scheduledStart: st.scheduledStart || null,
        scheduledEnd: st.scheduledEnd || null,
      })
    );

    // Sanitize calendar events
    const calendarEvents = (parsed.calendarEvents || []).map(
      (ev: Record<string, unknown>) => ({
        title: String(ev.title || "Focus Time"),
        description: String(ev.description || ""),
        startTime: String(ev.startTime || ""),
        endTime: String(ev.endTime || ""),
      })
    );

    return Response.json({
      success: true,
      data: { subtasks, calendarEvents },
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Auto-plan API error:", err);
    return Response.json(
      { success: false, error: err.message || "Failed to generate plan" },
      { status: 500 }
    );
  }
}

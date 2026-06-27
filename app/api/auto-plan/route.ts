import { NextRequest } from "next/server";

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

    // No longer requiring GEMINI_API_KEY for this route as we use Groq

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

    let groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      try {
        const fs = require("fs");
        const envContent = fs.readFileSync(".env.local", "utf8");
        const match = envContent.match(/GROQ_API_KEY=(.*)/);
        if (match) groqKey = match[1].trim();
      } catch (e) {}
    }

    if (!groqKey) {
      return Response.json({ success: false, error: "Groq API key not configured" }, { status: 500 });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a productivity AI that breaks down large tasks into actionable subtasks. Return ONLY raw, valid JSON matching the schema." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
      })
    });

    if (!groqRes.ok) throw new Error("Groq API failed");
    const groqData = await groqRes.json();
    let responseText = groqData.choices[0].message.content.trim();

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

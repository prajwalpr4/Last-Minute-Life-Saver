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
          { role: "system", content: "You are an emergency productivity AI. The user is PANICKING because they procrastinated. Return ONLY raw, valid JSON matching the schema." },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
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

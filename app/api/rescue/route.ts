import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { uid, task, googleToken } = await request.json();

    if (!uid || !task || !googleToken) {
      return Response.json(
        { success: false, error: "Missing required fields or Google Token" },
        { status: 400 }
      );
    }

    // Fetch user's calendar events from now until the task deadline (or next 3 days)
    const timeMin = new Date().toISOString();
    const deadlineDate = task.deadline ? new Date(task.deadline) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const timeMax = deadlineDate.toISOString();

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
      {
        headers: { Authorization: `Bearer ${googleToken}` },
      }
    );
    const calData = await calRes.json();
    const events = calData.items || [];

    // Initialize Gemini 3.1 Pro with High Thinking Level
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-pro-preview",
      generationConfig: {
        thinkingConfig: {
          thinkingLevel: "high",
        },
        responseMimeType: "application/json",
      } as any,
    });

    const prompt = `You are a Predictive Deadline Rescue Agent. A user is at risk of missing the deadline for task: "${task.title}".
    
    Task Details:
    - Description: ${task.description || "None"}
    - Deadline: ${task.deadline}
    - Remaining Subtasks: ${JSON.stringify(task.subtasks?.filter((s: any) => s.status !== "completed"))}
    
    Here is their Google Calendar for the relevant time window:
    ${JSON.stringify(events.map((e: any) => ({
      id: e.id,
      summary: e.summary,
      start: e.start?.dateTime,
      end: e.end?.dateTime,
    })))}
    
    Your job is to identify GENUINELY low-priority/movable events (e.g. "Gym", "Catch up with friend", "Lunch") and propose moving them to free up a single "Rescue Block" for the user to finish this task before the deadline. Do NOT move highly sensitive things like "Doctor appointment" or "Flight".
    
    Respond strictly in this JSON format:
    {
      "proposedMoves": [
        { "eventId": "string", "eventSummary": "string", "action": "delete" | "reschedule", "proposedNewTime": "ISOString or null" }
      ],
      "rescueBlock": {
        "summary": "Rescue Block: [Task Title]",
        "start": "ISOString",
        "end": "ISOString"
      },
      "reasoning": "A short, empathetic explanation of what you are proposing and why, e.g. 'I noticed you're going to miss your deadline. I can move your Gym session to tomorrow to free up 2 hours for you to finish this. Want me to?'"
    }`;

    let rescueProposal: any;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      rescueProposal = JSON.parse(responseText);
    } catch (err) {
      let groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) {
        try {
          const fs = require("fs");
          const envContent = fs.readFileSync(".env.local", "utf8");
          const match = envContent.match(/GROQ_API_KEY=(.*)/);
          if (match) groqKey = match[1].trim();
        } catch (e) {}
      }

      if (groqKey) {
        console.log("Gemini failed, falling back to Groq for rescue API...");
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a helpful AI assistant. Always return ONLY raw, valid JSON matching the requested schema. Do NOT wrap in markdown." },
              { role: "user", content: prompt }
            ],
            temperature: 0.2,
          })
        });
        if (!groqRes.ok) throw new Error("Groq fallback failed");
        const groqData = await groqRes.json();
        let cleaned = groqData.choices[0].message.content.trim();
        const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) cleaned = match[1].trim();
        rescueProposal = JSON.parse(cleaned);
      } else {
        throw err;
      }
    }

    return Response.json({ success: true, data: rescueProposal });
  } catch (error: any) {
    console.error("Rescue generation error:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to generate rescue proposal" },
      { status: 500 }
    );
  }
}

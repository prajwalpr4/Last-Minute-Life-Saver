import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { uid, scenario, tasks, googleToken } = await request.json();

    if (!uid || !scenario) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    let events = [];
    if (googleToken) {
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      try {
        const calRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
          { headers: { Authorization: `Bearer ${googleToken}` } }
        );
        const calData = await calRes.json();
        events = calData.items || [];
      } catch (e) {
        console.error("Failed to fetch calendar for simulation", e);
      }
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-pro-preview",
      generationConfig: {
        thinkingConfig: {
          thinkingLevel: "high", // Strategic advisor feature requires high reasoning
        },
        responseMimeType: "application/json",
      } as any,
    });

    const prompt = `You are a "What-If" Schedule Simulator and Strategic Advisor.
    The user is asking a hypothetical question about their schedule: "${scenario}"
    
    Current Tasks: ${JSON.stringify(tasks.map((t: any) => ({ title: t.title, deadline: t.deadline, priority: t.priority })))}
    Upcoming Calendar Events (Next 7 days): ${JSON.stringify(events.map((e: any) => ({ summary: e.summary, start: e.start?.dateTime, end: e.end?.dateTime })))}
    
    Analyze the impact of their hypothetical scenario. Do NOT make changes. Just simulate the outcome.
    
    Return ONLY a JSON object in this format:
    {
      "warnings": ["string", "string"], // Critical risks or missed deadlines caused by this
      "tradeoffs": ["string", "string"], // What they gain vs what they lose
      "affectedTasks": [
        { "taskTitle": "string", "impact": "delayed" | "rushed" | "failed" | "improved", "reason": "string" }
      ],
      "conclusion": "A 2-sentence strategic recommendation."
    }`;

    let simulation: any;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      simulation = JSON.parse(responseText);
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
        console.log("Gemini failed, falling back to Groq for simulate API...");
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
        simulation = JSON.parse(cleaned);
      } else {
        throw err;
      }
    }

    return Response.json({ success: true, data: simulation });
  } catch (error: any) {
    console.error("Simulation error:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to run simulation" },
      { status: 500 }
    );
  }
}

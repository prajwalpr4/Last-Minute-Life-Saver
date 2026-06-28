import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { parseJson } from "@/lib/json-parser";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { uid, events } = await request.json();

    if (!uid || !events || !Array.isArray(events)) {
      return Response.json(
        { success: false, error: "Missing required fields or events" },
        { status: 400 }
      );
    }

    if (events.length === 0) {
      return Response.json({
        success: true,
        data: {
          riskyCategories: [],
          riskyTimeWindows: [],
          strongTimeWindows: [],
          summary: "Not enough history to generate a profile yet."
        }
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-pro-preview",
      generationConfig: {
        thinkingConfig: {
          thinkingLevel: "high", // Behavioral analysis requires high reasoning
        },
        responseMimeType: "application/json",
      } as any,
    });

    const prompt = `You are an AI Behavioral Analyst. Analyze the user's task history to build a productivity profile.
    
    Task History Events: ${JSON.stringify(events)}
    
    Return ONLY a JSON object in this format:
    {
      "riskyCategories": ["string"], // e.g. "coding", "writing" where they often panic or delay
      "riskyTimeWindows": ["string"], // e.g. "21:00-23:59"
      "strongTimeWindows": ["string"], // e.g. "08:00-11:00"
      "summary": "A 2-sentence summary of their work habits."
    }`;

    let profile: any;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      profile = parseJson(responseText);
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
        console.log("Gemini failed, falling back to Groq for profile API...");
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
        const rawContent = groqData.choices[0].message.content;
        profile = parseJson(rawContent);
      } else {
        throw err;
      }
    }

    return Response.json({ success: true, data: profile });
  } catch (error: any) {
    console.error("Profile generation error:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to generate profile" },
      { status: 500 }
    );
  }
}

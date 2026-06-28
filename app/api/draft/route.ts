import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { parseJson } from "@/lib/json-parser";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { uid, task } = await request.json();

    if (!uid || !task) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      );
    }

    // Initialize Gemini 3.1 Pro with High Thinking Level for complex reasoning
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-pro-preview",
      generationConfig: {
        thinkingConfig: {
          thinkingLevel: "high", // Deep Work Execution requires high reasoning
        },
        responseMimeType: "application/json",
      } as any,
    });

    const prompt = `You are a Deep Work Execution Agent. Your job is to read the context of a task and generate a highly detailed FIRST DRAFT for the user to start working from.
    This is designed to cure the "blank page" syndrome.
    
    Task Title: ${task.title}
    Task Description: ${task.description || "No description"}
    
    Analyze the task and return a JSON object with two fields:
    1. "draftType": A string that is exactly one of ["text", "code", "outline"] depending on what fits best.
    2. "draftContent": The actual generated first draft. If text, make it a full draft letter/essay/document. If code, provide the full boilerplate structure or actual script. If outline, provide a detailed step-by-step or slide-by-slide structure. Use markdown formatting.`;

    let draftData: any;
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      draftData = parseJson(responseText);
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
        console.log("Gemini failed, falling back to Groq for draft API...");
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
        draftData = parseJson(rawContent);
      } else {
        throw err;
      }
    }

    return Response.json({ success: true, data: draftData });
  } catch (error: any) {
    console.error("Draft generation error:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to generate draft" },
      { status: 500 }
    );
  }
}

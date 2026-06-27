import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = formData.get("text") as string;
    const uid = formData.get("uid") as string;
    const file = (formData.get("file") || formData.get("image")) as File | null;

    if (!text && !file) {
      return Response.json(
        { success: false, error: "No input provided" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { success: false, error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Set up SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const sendStep = (step: string, data?: any) => {
          controller.enqueue(
            new TextEncoder().encode(JSON.stringify({ step, data }) + "\n")
          );
        };

        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-3.1-pro-preview",
            generationConfig: {
              thinkingConfig: {
                thinkingLevel: "medium", // Routine extraction and scheduling
              },
            } as any,
          });

          // Helper to call Gemini and parse JSON (with Groq Fallback)
          const askGemini = async (promptText: string, includeFile = false) => {
            const parseJson = (text: string) => {
              let cleaned = text.trim();
              const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
              if (match) {
                cleaned = match[1].trim();
              } else if (cleaned.startsWith("```")) {
                cleaned = cleaned.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
              } else {
                const firstBrace = cleaned.indexOf('{');
                const firstBracket = cleaned.indexOf('[');
                const lastBrace = cleaned.lastIndexOf('}');
                const lastBracket = cleaned.lastIndexOf(']');
                let startIdx = -1;
                let endIdx = -1;
                if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
                  startIdx = firstBrace;
                  endIdx = lastBrace;
                } else if (firstBracket !== -1) {
                  startIdx = firstBracket;
                  endIdx = lastBracket;
                }
                if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                  cleaned = cleaned.substring(startIdx, endIdx + 1);
                }
              }
              return JSON.parse(cleaned);
            };

            try {
              const parts: any[] = [{ text: promptText }];
              if (includeFile && file) {
                const bytes = await file.arrayBuffer();
                const base64 = Buffer.from(bytes).toString("base64");
                parts.push({
                  inlineData: {
                    mimeType: file.type,
                    data: base64,
                  },
                });
              }
              const result = await model.generateContent(parts);
              return parseJson(result.response.text());
            } catch (error: any) {
              // Fallback to Groq
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
                console.log("Gemini failed (likely rate limit), falling back to Groq API...");
                try {
                  let modelName = "llama-3.3-70b-versatile";
                  const messages: any[] = [
                    { role: "system", content: "You are a helpful AI assistant. Always return ONLY raw, valid JSON matching the requested schema. Do NOT wrap in markdown." },
                  ];

                  if (includeFile && file) {
                    if (file.type.startsWith("image/")) {
                      modelName = "llama-3.2-11b-vision-preview";
                      const bytes = await file.arrayBuffer();
                      const base64 = Buffer.from(bytes).toString("base64");
                      messages.push({
                        role: "user",
                        content: [
                          { type: "text", text: promptText },
                          { type: "image_url", image_url: { url: `data:${file.type};base64,${base64}` } }
                        ]
                      });
                    } else {
                      // Fallback for PDFs on Groq (just pass text)
                      messages.push({ role: "user", content: promptText + "\n\n[Note: A PDF was attached but could not be processed by the fallback AI, please rely on the text.]" });
                    }
                  } else {
                    messages.push({ role: "user", content: promptText });
                  }

                  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${groqKey}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      model: modelName,
                      messages: messages,
                      temperature: 0.1,
                    })
                  });

                  if (!groqRes.ok) {
                    const errText = await groqRes.text();
                    throw new Error("Groq fallback failed: " + errText);
                  }

                  const groqData = await groqRes.json();
                  return parseJson(groqData.choices[0].message.content);
                } catch (groqError) {
                  console.error("Groq fallback also failed:", groqError);
                  throw error; // Throw original Gemini error
                }
              }
              throw error; // Throw original Gemini error if no Groq key
            }
          };

          const userInputText = text || "[See attached file]";

          // Step 1: Categorizing
          sendStep("Categorizing");
          const step1Prompt = `Analyze the following user input and categorize it. Return ONLY a JSON object: { "categories": string[], "summary": "A 1-sentence summary of what the user wants to achieve" }
          
User Input: ${userInputText}`;
          const categorization = await askGemini(step1Prompt, true);

          // Step 2: Breaking down
          sendStep("Breaking down");
          const step2Prompt = `Based on the user's intent: "${categorization.summary}", break the work down into distinct, actionable task names. 
Return ONLY a JSON array of strings (the task names).`;
          const rawTasks = await askGemini(step2Prompt, false);

          // Step 3: Estimating
          sendStep("Estimating");
          const step3Prompt = `Given these tasks: ${JSON.stringify(rawTasks)}, estimate the priority for each (low, medium, high, urgent).
Return ONLY a JSON array of objects: { "title": string, "priority": string }`;
          const prioritizedTasks = await askGemini(step3Prompt, false);

          // Step 4: Scheduling
          sendStep("Scheduling");
          const step4Prompt = `Given these prioritized tasks: ${JSON.stringify(prioritizedTasks)}, infer a timeframe or deadline if implied by the original user input: "${userInputText}".
Also, consider their Productivity Profile if available: ${uid ? "Check profile" : "Unknown"}. If they are weak in the morning, do not schedule hard tasks then.
Return ONLY a JSON array of objects: { "title": string, "priority": string, "timeframe": "string or null" }`;
          const scheduledTasks = await askGemini(step4Prompt, false);

          // Step 5: Finalizing
          sendStep("Finalizing");
          const step5Prompt = `Finalize these tasks: ${JSON.stringify(scheduledTasks)}. Format them into the final schema.
Return ONLY a JSON array of objects matching exactly: { "title": string, "description": string (short 1 sentence detail), "priority": string (low, medium, high, urgent), "reason": string (a short sentence explaining why this task was prioritized or scheduled this way), "deadline": string (YYYY-MM-DD) | null (if a timeframe/deadline was inferred) }. Make sure priority strictly matches one of those 4 strings.`;
          const finalTasks = await askGemini(step5Prompt, false);

          // Send final completion
          sendStep("Done", finalTasks);
          controller.close();
        } catch (error: any) {
          console.error("Chain error:", error);
          sendStep("Error", error.message || "Failed to extract tasks");
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Brain dump API root error:", error);
    return Response.json(
      { success: false, error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  const { transcript, uid } = await request.json();

  if (!transcript || !uid) {
    return Response.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (action: string, detail: string) => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify({ action, detail }) + "\n"));
      };

      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-3.1-pro-preview",
          tools: [
            {
              functionDeclarations: [
                {
                  name: "clearAfternoonSchedule",
                  description: "Deletes all calendar events in the afternoon (12pm to 5pm) today.",
                  parameters: { type: "object", properties: {} },
                },
                {
                  name: "createStudyBlock",
                  description: "Creates a study block in the calendar.",
                  parameters: {
                    type: "object",
                    properties: {
                      startTime: { type: "string", description: "ISO string or human readable time" },
                      endTime: { type: "string", description: "ISO string or human readable time" },
                      durationHours: { type: "number" },
                    },
                  },
                },
                {
                  name: "rescheduleTask",
                  description: "Moves a deadline for a specific task.",
                  parameters: {
                    type: "object",
                    properties: {
                      taskName: { type: "string" },
                      newDeadline: { type: "string" },
                    },
                    required: ["taskName", "newDeadline"],
                  },
                },
              ],
            },
          ],
        });

        let calls: any[] = [];
        try {
          const chat = model.startChat();
          const result = await chat.sendMessage(`User command: "${transcript}". Execute the appropriate functions to fulfill this command. Do not ask for confirmation, just execute.`);
          const geminiCalls = result.response.functionCalls();
          if (geminiCalls) {
            calls = geminiCalls.map(c => ({ name: c.name, args: c.args }));
          }
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
            sendUpdate("System", "Gemini rate limited. Falling back to Groq...");
            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${groqKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                  { role: "system", content: "You are a Voice Command AI. Execute the appropriate functions to fulfill the user's command. Do not ask for confirmation, just execute." },
                  { role: "user", content: `User command: "${transcript}"` }
                ],
                tools: [
                  { type: "function", function: { name: "clearAfternoonSchedule", description: "Deletes all calendar events in the afternoon (12pm to 5pm) today.", parameters: { type: "object", properties: {} } } },
                  { type: "function", function: { name: "createStudyBlock", description: "Creates a study block in the calendar.", parameters: { type: "object", properties: { startTime: { type: "string", description: "ISO string or human readable time" }, endTime: { type: "string", description: "ISO string or human readable time" }, durationHours: { type: "number" } } } } },
                  { type: "function", function: { name: "rescheduleTask", description: "Moves a deadline for a specific task.", parameters: { type: "object", properties: { taskName: { type: "string" }, newDeadline: { type: "string" } }, required: ["taskName", "newDeadline"] } } }
                ],
                tool_choice: "auto",
                temperature: 0.2,
              })
            });
            if (!groqRes.ok) throw new Error("Groq fallback failed");
            const groqData = await groqRes.json();
            const toolCalls = groqData.choices[0]?.message?.tool_calls;
            if (toolCalls) {
              calls = toolCalls.map((tc: any) => ({
                name: tc.function.name,
                args: JSON.parse(tc.function.arguments || "{}")
              }));
            }
          } else {
            throw err;
          }
        }

        if (calls.length > 0) {
          for (const call of calls) {
            if (call.name === "clearAfternoonSchedule") {
              sendUpdate("Calendar", "Clearing tomorrow's afternoon schedule...");
              await new Promise((r) => setTimeout(r, 1500)); // Simulate work
              sendUpdate("Success", "Schedule cleared.");
            } else if (call.name === "createStudyBlock") {
              const hrs = call.args.durationHours || 4;
              sendUpdate("Calendar", `Creating Study Block for ${hrs} hours...`);
              await new Promise((r) => setTimeout(r, 1500));
              sendUpdate("Success", "Study block created.");
            } else if (call.name === "rescheduleTask") {
              sendUpdate("Task", `Moving deadline for "${call.args.taskName}" to ${call.args.newDeadline}...`);
              await new Promise((r) => setTimeout(r, 1500));
              sendUpdate("Success", "Deadline updated.");
            }
          }
        } else {
          sendUpdate("Analysis", "No actionable commands found in transcript.");
        }

        controller.close();
      } catch (error: any) {
        console.error("Command error:", error);
        sendUpdate("Error", error.message || "Failed to execute command.");
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
}

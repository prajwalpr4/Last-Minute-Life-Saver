import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = formData.get("text") as string;
    const uid = formData.get("uid") as string;
    const imageFile = formData.get("image") as File | null;

    if (!text && !imageFile) {
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
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          // Helper to call Gemini and parse JSON
          const askGemini = async (promptText: string, includeImage = false) => {
            const parts: any[] = [{ text: promptText }];
            if (includeImage && imageFile) {
              const bytes = await imageFile.arrayBuffer();
              const base64 = Buffer.from(bytes).toString("base64");
              parts.push({
                inlineData: {
                  mimeType: imageFile.type,
                  data: base64,
                },
              });
            }
            const result = await model.generateContent(parts);
            let responseText = result.response.text().trim();
            const match = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (match) {
              responseText = match[1].trim();
            } else if (responseText.startsWith("```")) {
              responseText = responseText.replace(/^```json?\s*/i, "").replace(/```$/i, "").trim();
            }
            return JSON.parse(responseText);
          };

          const userInputText = text || "[See attached image]";

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
Return ONLY a JSON array of objects: { "title": string, "priority": string, "timeframe": "string or null" }`;
          const scheduledTasks = await askGemini(step4Prompt, false);

          // Step 5: Finalizing
          sendStep("Finalizing");
          const step5Prompt = `Finalize these tasks: ${JSON.stringify(scheduledTasks)}. Format them into the final schema.
Return ONLY a JSON array of objects matching exactly: { "title": string, "description": string (short 1 sentence detail), "priority": string (low, medium, high, urgent) }. Make sure priority strictly matches one of those 4 strings.`;
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

import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return Response.json(
        { success: false, error: "Token required" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Fetch next 5 events
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];
    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.summary || "Untitled Event",
      description: event.description || "",
      start: event.start?.dateTime || event.start?.date || new Date().toISOString(),
      end: event.end?.dateTime || event.end?.date || new Date().toISOString(),
      link: event.htmlLink || null,
    }));

    return Response.json({
      success: true,
      data: formattedEvents,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Calendar API error:", err);
    return Response.json(
      { success: false, error: err.message || "Calendar fetch failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, tasks, rescueMode, proposal } = await request.json();

    if (!token) {
      return Response.json(
        { success: false, error: "Google Calendar token required" },
        { status: 401 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    if (rescueMode && proposal) {
      const executed = [];
      // 1. Process proposed moves/deletions
      for (const move of proposal.proposedMoves) {
        if (move.action === "delete") {
          await calendar.events.delete({ calendarId: "primary", eventId: move.eventId });
          executed.push(`Deleted ${move.eventSummary}`);
        } else if (move.action === "reschedule" && move.proposedNewTime) {
          // get existing event to keep other details
          const ev = await calendar.events.get({ calendarId: "primary", eventId: move.eventId });
          const updatedEvent = ev.data;
          
          // calculate original duration to keep it same
          const origStart = new Date(updatedEvent.start?.dateTime || updatedEvent.start?.date || Date.now());
          const origEnd = new Date(updatedEvent.end?.dateTime || updatedEvent.end?.date || Date.now());
          const duration = origEnd.getTime() - origStart.getTime();
          
          const newStart = new Date(move.proposedNewTime);
          const newEnd = new Date(newStart.getTime() + duration);
          
          updatedEvent.start = { dateTime: newStart.toISOString() };
          updatedEvent.end = { dateTime: newEnd.toISOString() };
          
          await calendar.events.update({
            calendarId: "primary",
            eventId: move.eventId,
            requestBody: updatedEvent
          });
          executed.push(`Rescheduled ${move.eventSummary}`);
        }
      }

      // 2. Create Rescue Block
      const rb = proposal.rescueBlock;
      await calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary: rb.summary,
          description: "AI Generated Rescue Block",
          start: { dateTime: rb.start },
          end: { dateTime: rb.end }
        }
      });
      executed.push(`Created Rescue Block`);

      return Response.json({ success: true, data: { executed } });
    }

    if (!tasks || !Array.isArray(tasks)) {
      return Response.json(
        { success: false, error: "Tasks array required" },
        { status: 400 }
      );
    }

    const createdEvents = [];

    for (const task of tasks) {
      // Basic event setup
      const event: any = {
        summary: task.title,
        description: task.description + (task.reason ? `\n\nAI Reasoning: ${task.reason}` : ""),
      };

      if (task.deadline) {
        // all day event for deadline
        event.start = { date: task.deadline };
        event.end = { date: task.deadline };
      } else {
        // fallback to today if no date provided
        const today = new Date().toISOString().split('T')[0];
        event.start = { date: today };
        event.end = { date: today };
      }

      const res = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });
      createdEvents.push(res.data);
    }

    return Response.json({ success: true, data: createdEvents });
  } catch (error: any) {
    console.error("Calendar sync POST error:", error);
    return Response.json({ success: false, error: error.message || "Failed to sync calendar" }, { status: 500 });
  }
}


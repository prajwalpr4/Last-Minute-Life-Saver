import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return Response.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // For now, return placeholder events until Google Calendar OAuth is fully set up
    // In production, this would use the stored Google OAuth tokens to call Calendar API
    // The user needs to configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

    const hasGoogleConfig =
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

    if (!hasGoogleConfig) {
      // Return demo events so the UI isn't empty
      const now = new Date();
      const demoEvents = [
        {
          id: "demo-1",
          title: "Focus Time: Project Work",
          description: "Deep work session",
          start: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            14,
            0
          ).toISOString(),
          end: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            16,
            0
          ).toISOString(),
          link: null,
        },
        {
          id: "demo-2",
          title: "Review & Planning",
          description: "Daily review session",
          start: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            17,
            0
          ).toISOString(),
          end: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            17,
            30
          ).toISOString(),
          link: null,
        },
        {
          id: "demo-3",
          title: "Team Standup",
          description: "Daily sync meeting",
          start: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            10,
            0
          ).toISOString(),
          end: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            10,
            15
          ).toISOString(),
          link: null,
        },
      ];

      return Response.json({
        success: true,
        data: demoEvents,
        demo: true,
      });
    }

    // TODO: Implement full Google Calendar API integration
    // 1. Retrieve stored OAuth tokens from Firestore for this user
    // 2. Create OAuth2 client with google-auth-library
    // 3. Call calendar.events.list for the next 5 events
    // 4. Return formatted CalendarEvent[]

    return Response.json({
      success: true,
      data: [],
      message: "Calendar API configured but not yet connected for this user",
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

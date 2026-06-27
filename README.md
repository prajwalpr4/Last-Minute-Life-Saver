# The Last-Minute Life Saver — AI Productivity Agent

An AI-powered productivity agent that goes beyond passive reminders to autonomously plan, schedule, and execute tasks for users.

## Tech Stack
- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Backend/Auth:** Firebase (Auth, Firestore, Storage)
- **AI Engine:** Google Gemini 1.5 Pro/Flash
- **Deployment:** Google Cloud Run (Dockerized)

## Quick Start

### 1. Set up environment variables
```bash
cp .env.example .env.local
# Fill in your Firebase and Gemini API keys
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- 🧠 **Multimodal Brain Dump** — Text, voice (Web Speech API), or image input processed by Gemini 1.5 Pro
- 🤖 **Autonomous Auto-Plan** — Gemini 1.5 Flash breaks tasks into subtasks with time estimates
- 📅 **Google Calendar Sync** — OAuth-connected calendar events widget
- 🚨 **Panic Mode** — Hyper-compressed 3-hour survival schedule generated on demand

## Application Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, how it works |
| `/login` | Split-screen auth (Email/Password + Google OAuth) |
| `/dashboard` | Protected main app hub |
| `/profile` | Protected profile settings |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/brain-dump` | POST | Gemini multimodal task extraction |
| `/api/auto-plan` | POST | Gemini Flash subtask generation |
| `/api/panic-mode` | POST | Gemini survival schedule generation |
| `/api/calendar` | GET | Google Calendar events |

## Firebase Data Structure

```
users/{uid}
  name, email, phone, bio, profilePicUrl, googleCalendarConnected

tasks/{taskId}
  uid, title, description, deadline, priority, status, isPanicActive, createdAt

subtasks/{subtaskId}
  uid, parentTaskId, title, description, status, estimatedTime, scheduledStart, scheduledEnd
```

## Environment Variables

See `.env.example` for all required variables:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config
- `FIREBASE_SERVICE_ACCOUNT_KEY` — Server-side Firebase Admin
- `GEMINI_API_KEY` — Google Gemini AI
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Calendar OAuth

## Deployment (Cloud Run)

```bash
# Build Docker image
docker build -t lastminsaver \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=xxx \
  ... .

# Push to Artifact Registry and deploy
gcloud run deploy lastminsaver \
  --image gcr.io/PROJECT_ID/lastminsaver \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=xxx,FIREBASE_SERVICE_ACCOUNT_KEY=xxx
```

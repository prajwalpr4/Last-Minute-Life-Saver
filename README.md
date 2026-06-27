<div align="center">
  <div style="padding: 20px; border-radius: 20px; background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(236,72,153,0.1)); display: inline-block;">
    <h1 align="center">⚡ LastMinSaver</h1>
  </div>
  <p align="center">
    <strong>The Ultimate Agentic AI Productivity Engine for Procrastinators</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Google_Gemini-3.1_Pro-4285F4?style=for-the-badge&logo=google" alt="Google Gemini" />
    <img src="https://img.shields.io/badge/Firebase-Auth_%7C_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  </p>
</div>

---

## 🚀 The Vision: Problem Solving & Impact
**Traditional to-do lists are passive.** They wait for you to fail. **LastMinSaver** is an *active, agentic productivity partner* built specifically for students, professionals, and neurodivergent individuals who struggle with executive dysfunction, ADHD, or chronic procrastination. 

Instead of overwhelming you with a blank list, LastMinSaver uses deep AI agency to automatically extract tasks from your chaotic thoughts (Voice/Image/Text), plan your week, and deploy hyper-compressed "survival schedules" when a deadline is imminent. **It doesn't just track work; it saves you when you're out of time.**

---

## 🧠 Agentic Depth
LastMinSaver doesn't just use AI for chat; it deploys independent AI agents to manipulate your productivity graph in the background:

- **🎙️ The Brain Dump Engine**: Speak chaotically into the app, upload a syllabus, or brain-dump text. The agent extracts actionable tasks, assigns priorities, and infers deadlines automatically.
- **🚨 Panic Mode (The Survival Agent)**: When a deadline is hours away, you don't need a to-do list—you need a lifeline. Panic Mode generates a hyper-compressed, minute-by-minute survival schedule ruthlessly cutting out non-essentials.
- **🔮 What-If Simulator**: Safely test decisions before making them. *("What if I sleep 8 hours instead of 4?")* The AI runs your proposed timeline against your real schedule, warning you of cascading failures and tradeoffs without altering your actual database.
- **🦸‍♂️ Deadline Rescue**: If the AI detects an impending failure, it proactively proposes schedule reorganizations, automatically moving low-priority tasks to save critical deadlines.
- **📝 Deep Work Drafter**: Don't start from a blank page. The AI generates structural outlines, boilerplate code, or essay drafts instantly attached to your tasks to defeat the "starting friction."

---

## ✨ Innovation & Creativity
LastMinSaver rethinks the productivity UI from the ground up:
- **Zero-Friction Ingestion**: Stop typing out tasks. Just talk to it or show it a picture.
- **Behavioral Profiling**: The app quietly analyzes your task completion patterns and generates a unique "Productivity Profile" (e.g., "The Midnight Sprinter" or "The Caffeinated Perfectionist"), providing personalized advice on how *you* specifically work best.
- **Dual-Brain Architecture**: The system utilizes **Google Gemini 3.1 Pro** for deep, complex reasoning (Behavioral Analysis, What-If Simulations). However, for mission-critical, instant UI updates (Panic Mode, Auto-Plan), it utilizes **Groq's LPU inference** for near-zero latency, ensuring the app feels native and never blocks the user.

---

## 🛠️ Usage of Google Technologies
This application heavily leverages the Google ecosystem for maximum scale and intelligence:
1. **Google Gemini 3.1 Pro API**: Powers the core reasoning engine. We specifically utilize its massive context window and advanced instruction-following capabilities to process unstructured text/audio and output strict JSON execution plans.
2. **Firebase Authentication**: Seamless, secure user onboarding.
3. **Cloud Firestore**: Real-time NoSQL database syncing your tasks, subtasks, and calendar events instantly across all devices.
4. **Firebase Storage (Pending)**: For handling user-uploaded assets (images, PDFs) to be processed by Gemini's multimodal endpoints.

---

## 🎨 Product Experience & Design
- **Glassmorphism & Micro-interactions**: Built with Tailwind CSS and Framer Motion, every interaction—from checking off a task to triggering Panic Mode—feels tactile, rewarding, and premium.
- **100% Mobile Optimized**: The entire application is responsive. Complex data grids elegantly collapse into stacked mobile views, the calendar expands touch-targets to 44px, and custom slide-over menus ensure a native-app feel on iOS and Android browsers.
- **Dark Mode Native**: A sleek, dark-slate aesthetic designed to reduce eye strain during late-night cram sessions.

---

## ⚙️ Technical Implementation
- **Framework**: Next.js 16.2 App Router with Turbopack for lightning-fast HMR and server-side rendering.
- **State & Sync**: Firebase `onSnapshot` listeners provide real-time reactivity without manual refetching. 
- **AI Integration**: Robust API routes in Next.js handle the prompt engineering, JSON schema enforcement, and API fallback logic (Gemini → Groq) to guarantee 99.9% uptime for AI features.
- **Custom Calendar Engine**: A completely native, dependency-free calendar grid built from scratch using pure JavaScript Date math to map Firestore timestamps to a beautiful UI.

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase Project (with Auth and Firestore enabled)
- Google Gemini API Key
- Groq API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prajwalpr4/Last-Minute-Life-Saver.git
   cd lastminsaver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

<div align="center">
  <p><strong>Developed by Prajwal P Raikar</strong></p>
  <p><em>Built for the future of productivity.</em></p>
</div>

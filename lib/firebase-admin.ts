// lib/firebase-admin.ts
// Server-side Firebase Admin SDK initialization
// ONLY use in API routes / Server Actions — NEVER import on client

import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Use service account credentials from environment
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccount) {
    // Parse the JSON service account key
    const parsed = JSON.parse(serviceAccount);
    return initializeApp({
      credential: cert(parsed),
    });
  }

  // Fallback: running on Google Cloud (e.g., Cloud Run) with default credentials
  return initializeApp();
}

const adminApp = getAdminApp();
const adminAuth: Auth = getAuth(adminApp);
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminAuth, adminDb };

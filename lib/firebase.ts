// lib/firebase.ts
// Client-side Firebase initialization
// Uses NEXT_PUBLIC_ env vars (safe for browser)
// Uses lazy function-based access to prevent build-time crashes

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ─── Firebase Configuration ──────────────────────────────────────────────────
const getFirebaseConfig = () => {
  const isClient = typeof window !== "undefined";
  const clientConfig = isClient ? (window as any).__FIREBASE_CONFIG__ : null;

  return {
    apiKey: clientConfig?.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: clientConfig?.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: clientConfig?.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: clientConfig?.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: clientConfig?.messagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: clientConfig?.appId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: clientConfig?.measurementId || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
};

// ─── Lazy Firebase App ───────────────────────────────────────────────────────
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(getFirebaseConfig());
}

// ─── Lazy service accessors (only call at runtime, never at import) ──────────
export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorage() {
  return getStorage(getFirebaseApp());
}

export function getGoogleAuthProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/calendar");
  provider.addScope("https://www.googleapis.com/auth/calendar.events");
  return provider;
}

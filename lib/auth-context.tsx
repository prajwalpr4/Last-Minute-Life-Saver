"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  type User as FirebaseUser,
  type UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import {
  getFirebaseAuth,
  getFirebaseDb,
  getGoogleAuthProvider,
} from "@/lib/firebase";

// ─── Types ───────────────────────────────────────────────────────────────────
interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (
    email: string,
    password: string,
    name: string
  ) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helper: Create/Update user document in Firestore ────────────────────────
async function ensureUserDocument(
  user: FirebaseUser,
  extraData?: { name?: string }
) {
  const db = getFirebaseDb();
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: extraData?.name || user.displayName || "",
      email: user.email || "",
      phone: "",
      bio: "",
      profilePicUrl: user.photoURL || "",
      googleCalendarConnected: false,
      points: 0,
      streak: 0,
      vibeScore: 50,
      lastActiveDate: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Email/Password Sign In
  const signInWithEmail = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Email/Password Sign Up
  const signUpWithEmail = async (
    email: string,
    password: string,
    name: string
  ) => {
    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(credential.user, { displayName: name });
    await ensureUserDocument(credential.user, { name });
    return credential;
  };

  // Google Sign In (with Calendar scope)
  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    const db = getFirebaseDb();
    const googleProvider = getGoogleAuthProvider();

    const credential = await signInWithPopup(auth, googleProvider);
    await ensureUserDocument(credential.user);

    // Extract access token
    const oAuthCred = GoogleAuthProvider.credentialFromResult(credential);
    const accessToken = oAuthCred?.accessToken || null;

    // Mark calendar as connected and store token
    const userRef = doc(db, "users", credential.user.uid);
    await setDoc(
      userRef,
      {
        googleCalendarConnected: true,
        googleAccessToken: accessToken,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return credential;
  };

  // Sign Out
  const signOut = async () => {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  };

  // Force Refresh User
  const refreshUser = async () => {
    const auth = getFirebaseAuth();
    if (auth.currentUser) {
      // Create a shallow copy to force React state update
      setUser(Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser));
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      refreshUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import type { User } from "@/types";
import {
  Camera,
  Save,
  Loader2,
  User as UserIcon,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  CalendarCheck,
  Shield,
  Pencil,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // ─── Load profile from Firestore ────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as User;
        setProfile(data);
        setName(data.name || user.displayName || "");
        setPhone(data.phone || "");
        setBio(data.bio || "");
        setAvatarPreview(data.profilePicUrl || user.photoURL || null);
        setProfile({ ...data, vibeScore: data.vibeScore || 0, points: data.points || 0, streak: data.streak || 0 });
      } else {
        // Fallback to auth data
        setName(user.displayName || "");
        setAvatarPreview(user.photoURL || null);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ─── Handle avatar upload ────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploadingPhoto(true);
    try {
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, `profilepics/${user.uid}.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore
      const db = getFirebaseDb();
      await updateDoc(doc(db, "users", user.uid), {
        profilePicUrl: downloadURL,
        updatedAt: serverTimestamp(),
      });

      setAvatarPreview(downloadURL);
      setProfile((prev) => ({ ...prev, profilePicUrl: downloadURL }));
      toast.success("Profile photo updated! 📸");
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ─── Save profile ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        updatedAt: serverTimestamp(),
      });

      setProfile((prev) => ({
        ...prev,
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
      }));

      toast.success("Profile saved successfully! ✅");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="card-elevated p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-24 h-24 skeleton rounded-full" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-6 skeleton rounded w-1/3" />
                <div className="h-4 skeleton rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 skeleton rounded w-24 mb-2" />
                  <div className="h-11 skeleton rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Profile Settings
          </h1>
          <p className="text-muted-foreground font-light mt-1">
            Manage your account information
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* ── Gamification Stats Card ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.02 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="card-elevated p-6 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
              <span className="text-3xl font-bold">{profile.vibeScore || 0}</span>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80 mt-1">Vibe Score</span>
            </div>
            <div className="card-elevated p-6 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
              <span className="text-3xl font-bold">{profile.points || 0}</span>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80 mt-1">Points</span>
            </div>
            <div className="card-elevated p-6 flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <span className="text-3xl font-bold flex items-center gap-1">
                🔥 {profile.streak || 0}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80 mt-1">Day Streak</span>
            </div>
          </motion.div>

          {/* ── Avatar & Identity Card ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="card-elevated p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="relative"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white">
                      {initials}
                    </div>
                  )}

                  {/* Upload overlay */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white shadow-md border-2 border-white hover:shadow-lg transition-shadow disabled:opacity-50"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </motion.button>
                </motion.div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Identity info */}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  {name || "Your Name"}
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  {user?.email}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" />
                    Email Verified
                  </span>
                  {profile.googleCalendarConnected && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-medium text-blue-700">
                      <CalendarCheck className="w-3 h-3" />
                      Calendar Connected
                    </span>
                  )}
                </div>
              </div>

              {/* Edit hint */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-slate-50 rounded-lg px-3 py-2">
                <Pencil className="w-3 h-3" />
                Click camera to update photo
              </div>
            </div>
          </motion.div>

          {/* ── Profile Form ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="card-elevated p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground tracking-tight">
                Personal Information
              </h3>
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="profile-name"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="input !pl-10"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label
                  htmlFor="profile-email"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Email Address{" "}
                  <span className="text-muted-foreground font-light text-xs">
                    (read-only)
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="profile-email"
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="input !pl-10 bg-slate-50 text-muted-foreground cursor-not-allowed"
                  />
                  <Shield className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="profile-phone"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Phone Number{" "}
                  <span className="text-muted-foreground font-light text-xs">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="input !pl-10"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label
                  htmlFor="profile-bio"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Bio{" "}
                  <span className="text-muted-foreground font-light text-xs">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    className="textarea !pl-10 min-h-[90px]"
                    maxLength={300}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {bio.length}/300
                </p>
              </div>

              {/* Save button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-primary px-8 py-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ── Account Security Card ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                Account Details
              </h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">User ID</p>
                <p className="text-sm font-mono text-foreground truncate">
                  {user?.uid?.slice(0, 16)}...
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">
                  Sign-in Method
                </p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {user?.providerData?.[0]?.providerId === "google.com"
                    ? "Google"
                    : "Email & Password"}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">
                  Calendar Sync
                </p>
                <p
                  className={`text-sm font-medium ${
                    profile.googleCalendarConnected
                      ? "text-emerald-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {profile.googleCalendarConnected ? "Connected ✓" : "Not connected"}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1">
                  Account Status
                </p>
                <p className="text-sm font-medium text-emerald-600">
                  Active ✓
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFirebaseDb } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Trophy, Medal, Star } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface LeaderboardUser {
  id: string;
  displayName: string;
  email: string;
  points: number;
  vibeScore: number;
}

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const db = getFirebaseDb();
        const usersQuery = query(
          collection(db, "users"),
          orderBy("points", "desc"),
          limit(10)
        );
        const snapshot = await getDocs(usersQuery);
        const topUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as LeaderboardUser[];
        setUsers(topUsers);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Leaderboard
        </h1>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border/50 bg-muted/20">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Top Saviors
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete tasks to earn points and climb the ranks!
          </p>
        </div>

        <div className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-8 h-8 skeleton rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 skeleton rounded w-1/4" />
                  </div>
                  <div className="h-4 skeleton rounded w-16" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No data available yet.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {users.map((user, index) => {
                const isCurrentUser = currentUser?.uid === user.id;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                      isCurrentUser ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="w-8 font-bold text-muted-foreground flex justify-center">
                      {index === 0 ? (
                        <Medal className="w-6 h-6 text-yellow-500" />
                      ) : index === 1 ? (
                        <Medal className="w-6 h-6 text-gray-400" />
                      ) : index === 2 ? (
                        <Medal className="w-6 h-6 text-amber-600" />
                      ) : (
                        `#${index + 1}`
                      )}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-sm">
                      {(user.displayName || user.email || "U")[0].toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {user.displayName || user.email?.split("@")[0] || "Anonymous User"}
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Vibe Score: {user.vibeScore || 0}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">
                        {user.points || 0}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Points
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

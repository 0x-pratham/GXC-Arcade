// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { verifyUserSession, getUserScores } from "../../lib/actions";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      
      if (!authSession) {
        router.push('/');
        return;
      }

      setUser(authSession.user);

      // Fetch active session info
      const status = await verifyUserSession(authSession.user.id);
      setSessionInfo(status);

      // Fetch user's high scores
      const userScores = await getUserScores(authSession.user.id);
      setScores(userScores);
      
      setLoading(false);
    }
    
    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4effc] flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5f2396]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4effc] text-[#220849] font-body p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-[0_10px_30px_rgba(199,166,243,0.3)] border border-[#c7a6f3]/40 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="h-24 w-24 bg-[#5f2396] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading text-[#220849]">
              {user?.user_metadata?.username || "Player"}
            </h1>
            <p className="text-[#5f2396] font-bold opacity-80">{user?.email}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Session Status Box */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-md border border-[#c7a6f3]/40"
          >
            <h2 className="text-2xl font-bold font-heading mb-4 border-b border-[#c7a6f3]/30 pb-2">Arcade Session</h2>
            {sessionInfo?.allowed ? (
              <div>
                <p className="text-green-600 font-bold text-lg flex items-center gap-2">
                  🟢 Active Session
                </p>
                <p className="text-[#220849]/60 text-sm mt-2">
                  Expires at: {new Date(sessionInfo.session.end_time).toLocaleTimeString()}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-500 font-bold text-lg flex items-center gap-2">
                  🔴 {sessionInfo?.reason || "No Active Session"}
                </p>
              </div>
            )}
          </motion.div>

          {/* Personal High Scores */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl shadow-md border border-[#c7a6f3]/40"
          >
            <h2 className="text-2xl font-bold font-heading mb-4 border-b border-[#c7a6f3]/30 pb-2">Your Top Scores</h2>
            {scores.length === 0 ? (
              <p className="text-[#220849]/60 italic">You haven't played any games yet.</p>
            ) : (
              <ul className="space-y-3">
                {scores.map((score, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-[#f4effc] p-3 rounded-lg border border-[#c7a6f3]/20">
                    <span className="font-bold text-[#5f2396]">{score.games?.title}</span>
                    <span className="bg-[#220849] text-white px-3 py-1 rounded-full text-sm font-bold">
                      {score.score.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>

      </div>
    </main>
  );
}
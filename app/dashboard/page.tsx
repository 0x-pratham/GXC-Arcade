// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { motion } from "framer-motion";
import { Zap, Play, Lock, Gamepad2, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Check Authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      setUser(session.user);

      // 2. Fetch User Profile (For Credits)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // 3. Fetch Active Games
      const { data: gamesData } = await supabase
        .from("games")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (gamesData) setGames(gamesData);
      setLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-32 gap-4">
        <div className="w-10 h-10 border-4 border-[#e2d4f8] border-t-[#5f2396] rounded-full animate-spin"></div>
        <p className="text-[#220849]/60 font-medium text-sm">Loading...</p>
      </div>
    );
  }

  const hasCredits = profile?.credits > 0;
  const username = profile?.username || user?.email?.split('@')[0];

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-12 relative z-20">
      
      {/* 📊 WELCOME HEADER (Mobile Optimized) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white/70 backdrop-blur-xl border border-[#c7a6f3]/30 p-6 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      >
        <div className="w-full md:w-auto">
          <h1 className="text-3xl md:text-5xl font-black font-heading text-[#220849] leading-tight">
            Welcome back,<br className="hidden md:block" />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5f2396] to-[#a855f7]">
              {username}
            </span>
          </h1>
          <p className="text-[#220849]/60 font-medium text-sm md:text-base mt-2">
            Ready to test your reflexes today?
          </p>
        </div>

        {/* Credit Indicator - Full width on mobile */}
        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border w-full md:w-auto transition-colors shadow-sm ${hasCredits ? 'bg-white border-[#c7a6f3]/50' : 'bg-red-50 border-red-200'}`}>
          <div className={`p-2.5 rounded-xl ${hasCredits ? 'bg-[#f4effc] text-[#5f2396]' : 'bg-red-100 text-red-600'}`}>
            <Zap size={24} className={!hasCredits ? "animate-pulse" : ""} />
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-bold uppercase tracking-wider ${hasCredits ? 'text-[#220849]/60' : 'text-red-500'}`}>
              Available Credits
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-black leading-none ${hasCredits ? 'text-[#5f2396]' : 'text-red-600'}`}>
                {profile?.credits || 0}
              </span>
              <span className={`text-xs font-medium ${hasCredits ? 'text-[#220849]/40' : 'text-red-400'}`}>
                / {profile?.credits === 1 ? 'Play' : 'Plays'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🎮 GAMES GRID */}
      <div className="mb-8 flex items-center gap-3 px-1">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-[#c7a6f3]/30">
          <Gamepad2 size={20} className="text-[#5f2396]" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black font-heading text-[#220849]">Select a Game</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative bg-white rounded-[2rem] border ${hasCredits ? 'border-[#c7a6f3]/40 hover:border-[#5f2396]/50 hover:shadow-[0_20px_40px_rgba(95,35,150,0.08)]' : 'border-gray-200'} transition-all duration-300 flex flex-col overflow-hidden`}
          >
            {/* Thumbnail - Taller for better mobile visual balance */}
            <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-[#f4effc]">
              {game.thumbnail_url ? (
                <img 
                  src={game.thumbnail_url} 
                  alt={game.title} 
                  className={`w-full h-full object-cover transition-transform duration-700 ${hasCredits ? 'group-hover:scale-105' : 'grayscale opacity-60'}`} 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gamepad2 size={48} className="text-[#c7a6f3] opacity-40" />
                </div>
              )}
              
              {/* Inner Shadow for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>

              {/* Locked Overlay */}
              {!hasCredits && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[4px] flex items-center justify-center z-10">
                  <div className="bg-white px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg border border-gray-100">
                    <Lock size={18} className="text-gray-500" />
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Locked</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Content Area */}
            <div className="p-6 md:p-8 flex flex-col flex-1">
              <h3 className={`text-2xl font-black font-heading mb-3 ${hasCredits ? 'text-[#220849] group-hover:text-[#5f2396]' : 'text-gray-500'} transition-colors`}>
                {game.title}
              </h3>
              <p className={`text-sm font-medium leading-relaxed line-clamp-2 mb-8 flex-1 ${hasCredits ? 'text-[#220849]/60' : 'text-gray-400'}`}>
                {game.description}
              </p>
              
              {/* Conditional Play Button - Large touch target for mobile */}
              {hasCredits ? (
                <Link href={`/games/${game.id}`} className="mt-auto block">
                  <button className="w-full bg-[#f4effc] group-hover:bg-[#220849] text-[#220849] group-hover:text-white border border-[#c7a6f3]/50 px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 font-bold text-base shadow-sm">
                    Play Now
                    <Play size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              ) : (
                <div className="mt-auto flex items-center justify-center gap-2 w-full bg-gray-50 border border-gray-200 text-gray-400 px-6 py-4 rounded-xl cursor-not-allowed">
                  <AlertCircle size={18} />
                  <span className="font-bold text-base">0 Credits</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
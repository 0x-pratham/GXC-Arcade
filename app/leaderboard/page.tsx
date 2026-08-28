// app/leaderboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getGlobalLeaderboard } from "../../lib/actions";
import { Trophy, Medal, Gamepad2, Activity } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      const data = await getGlobalLeaderboard();
      setLeaders(data);
      setLoading(false);
    }
    fetchLeaders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4effc] flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#e2d4f8] border-t-[#5f2396] rounded-full animate-spin"></div>
        <p className="text-[#5f2396] font-mono font-bold text-sm tracking-widest uppercase animate-pulse">
          Syncing Ranks...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4effc] text-[#220849] font-body py-12 px-4 md:px-6 relative z-20">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-4 bg-[#5f2396] text-white rounded-2xl mb-4 shadow-[0_10px_30px_rgba(95,35,150,0.3)]">
            <Trophy size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-heading text-[#220849] mb-4 uppercase tracking-tight">
            Hall of Fame
          </h1>
          <p className="text-[#220849]/60 font-medium max-w-lg mx-auto">
            The ultimate ranking of GXC Arcade's most elite operators. Total scores are combined across all modules.
          </p>
        </motion.div>

        {/* Leaderboard List */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-4 md:p-8 shadow-[0_10px_40px_rgba(199,166,243,0.2)] border border-[#c7a6f3]/40">
          
          {leaders.length === 0 ? (
            <div className="text-center py-20">
              <Activity size={48} className="mx-auto text-[#c7a6f3] mb-4" />
              <p className="text-xl font-bold text-[#220849]">No scores recorded yet.</p>
              <p className="text-[#220849]/60 mt-2">Be the first to set a record!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:gap-4">
              {leaders.map((player, index) => {
                // Top 3 Styling Logic
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;
                
                let rankStyle = "bg-white border-[#c7a6f3]/30";
                let rankIcon = <span className="font-black text-xl text-[#220849]/40 w-8 text-center">{index + 1}</span>;

                if (isFirst) {
                  rankStyle = "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300 shadow-[0_5px_20px_rgba(253,224,71,0.4)] transform scale-[1.02] z-10";
                  rankIcon = <Medal size={28} className="text-yellow-500 w-8" />;
                } else if (isSecond) {
                  rankStyle = "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300 shadow-md";
                  rankIcon = <Medal size={28} className="text-gray-400 w-8" />;
                } else if (isThird) {
                  rankStyle = "bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300 shadow-md";
                  rankIcon = <Medal size={28} className="text-orange-500 w-8" />;
                }

                return (
                  <motion.div 
                    key={player.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border ${rankStyle} transition-all duration-300`}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      {rankIcon}
                      
                      <div className="flex flex-col">
                        <span className={`text-lg md:text-xl font-black font-heading ${isFirst ? 'text-yellow-700' : 'text-[#220849]'}`}>
                          {player.username}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#220849]/50 uppercase tracking-wider mt-1">
                          <Gamepad2 size={12} />
                          {player.games_played} {player.games_played === 1 ? 'Module' : 'Modules'} Played
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] font-mono font-bold text-[#220849]/40 uppercase tracking-widest mb-1">
                        Total Score
                      </span>
                      <span className={`text-2xl md:text-3xl font-black tabular-nums leading-none ${isFirst ? 'text-yellow-600' : 'text-[#5f2396]'}`}>
                        {player.total_score.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/dashboard">
            <button className="bg-[#220849] hover:bg-[#5f2396] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              Return to Dashboard
            </button>
          </Link>
        </div>

      </div>
    </main>
  );
}
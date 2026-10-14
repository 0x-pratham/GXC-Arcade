// app/leaderboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getGlobalLeaderboard,
  getAwsLeaderboard,
} from "../../lib/actions";
import {
  Trophy,
  Medal,
  Gamepad2,
  Activity,
  Cloud,
} from "lucide-react";
import Link from "next/link";

type Tab = "overall" | "aws";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overall");
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchLeaders() {
      setLoading(true);
      setError("");

      try {
        const data =
          activeTab === "overall"
            ? await getGlobalLeaderboard()
            : await getAwsLeaderboard();

        if (!cancelled) {
          setLeaders(data ?? []);
        }
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);

        if (!cancelled) {
          setLeaders([]);
          setError("Unable to load leaderboard. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLeaders();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-[#f4effc] text-[#220849] font-body py-12 px-4 md:px-6 relative z-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center p-4 bg-[#5f2396] text-white rounded-2xl mb-4 shadow-[0_10px_30px_rgba(95,35,150,0.3)]">
            <Trophy size={40} />
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-heading text-[#220849] mb-4 uppercase tracking-tight">
            Hall of Fame
          </h1>

          <p className="text-[#220849]/60 font-medium max-w-lg mx-auto">
            Celebrate the top performers of GXC Arcade.
            Compete across games and prove your skills.
          </p>
        </motion.div>

        {/* Leaderboard Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex w-full max-w-md rounded-2xl border border-[#c7a6f3]/50 bg-white p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab("overall")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all ${
                activeTab === "overall"
                  ? "bg-[#5f2396] text-white shadow-md"
                  : "text-[#220849]/60 hover:bg-[#f4effc]"
              }`}
            >
              <Trophy size={17} />
              Overall
            </button>

            <button
              onClick={() => setActiveTab("aws")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-all ${
                activeTab === "aws"
                  ? "bg-[#5f2396] text-white shadow-md"
                  : "text-[#220849]/60 hover:bg-[#f4effc]"
              }`}
            >
              <Cloud size={18} />
              AWS Cloud Quest
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-4 md:p-8 shadow-[0_10px_40px_rgba(199,166,243,0.2)] border border-[#c7a6f3]/40">
          {loading ? (
            <div className="flex flex-col justify-center items-center gap-4 py-20">
              <div className="w-12 h-12 border-4 border-[#e2d4f8] border-t-[#5f2396] rounded-full animate-spin" />

              <p className="text-[#5f2396] font-mono font-bold text-sm tracking-widest uppercase animate-pulse">
                Syncing Ranks...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Activity
                size={48}
                className="mx-auto text-red-400 mb-4"
              />
              <p className="text-lg font-bold text-[#220849]">
                {error}
              </p>

              <button
                onClick={() => setActiveTab(activeTab)}
                className="mt-4 rounded-xl bg-[#5f2396] px-5 py-3 font-bold text-white"
              >
                Try again
              </button>
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-20">
              {activeTab === "aws" ? (
                <Cloud
                  size={48}
                  className="mx-auto text-[#c7a6f3] mb-4"
                />
              ) : (
                <Activity
                  size={48}
                  className="mx-auto text-[#c7a6f3] mb-4"
                />
              )}

              <p className="text-xl font-bold text-[#220849]">
                No scores recorded yet.
              </p>

              <p className="text-[#220849]/60 mt-2">
                {activeTab === "aws"
                  ? "Play AWS Cloud Quest and claim the first rank!"
                  : "Be the first to set a record!"}
              </p>

              {activeTab === "aws" && (
                <Link
                  href="/aws-quiz"
                  className="inline-flex mt-6 rounded-xl bg-[#5f2396] px-6 py-3 font-bold text-white transition hover:bg-[#220849]"
                >
                  Play AWS Cloud Quest
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3 md:gap-4">
              {leaders.map((player, index) => {
                const isFirst = index === 0;
                const isSecond = index === 1;
                const isThird = index === 2;

                let rankStyle =
                  "bg-white border-[#c7a6f3]/30";

                let rankIcon = (
                  <span className="w-8 text-center font-black text-xl text-[#220849]/40">
                    {index + 1}
                  </span>
                );

                if (isFirst) {
                  rankStyle =
                    "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300 shadow-[0_5px_20px_rgba(253,224,71,0.4)]";

                  rankIcon = (
                    <Medal size={28} className="text-yellow-500 w-8" />
                  );
                } else if (isSecond) {
                  rankStyle =
                    "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300 shadow-md";

                  rankIcon = (
                    <Medal size={28} className="text-gray-400 w-8" />
                  );
                } else if (isThird) {
                  rankStyle =
                    "bg-gradient-to-r from-orange-100 to-orange-50 border-orange-300 shadow-md";

                  rankIcon = (
                    <Medal size={28} className="text-orange-500 w-8" />
                  );
                }

                const username =
                  player.username ??
                  player.profiles?.username ??
                  "Anonymous Player";

                const totalScore =
                  activeTab === "aws"
                    ? player.score
                    : player.total_score;

                return (
                  <motion.div
                    key={`${activeTab}-${player.user_id}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className={`flex items-center justify-between gap-3 p-4 md:p-5 rounded-2xl border ${rankStyle} transition-all duration-300`}
                  >
                    <div className="flex min-w-0 items-center gap-3 md:gap-6">
                      {rankIcon}

                      <div className="flex min-w-0 flex-col">
                        <span
                          className={`break-words text-base md:text-xl font-black font-heading ${
                            isFirst
                              ? "text-yellow-700"
                              : "text-[#220849]"
                          }`}
                        >
                          {username}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#220849]/50 uppercase tracking-wider mt-1">
                          <Gamepad2 size={12} />

                          {activeTab === "aws"
                            ? "AWS Cloud Quest"
                            : `${player.games_played} ${
                                player.games_played === 1
                                  ? "Module"
                                  : "Modules"
                              } Played`}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end text-right">
                      <span className="text-[10px] font-mono font-bold text-[#220849]/40 uppercase tracking-widest mb-1">
                        {activeTab === "aws"
                          ? "Best Score"
                          : "Total Score"}
                      </span>

                      <span
                        className={`text-2xl md:text-3xl font-black tabular-nums leading-none ${
                          isFirst
                            ? "text-yellow-600"
                            : "text-[#5f2396]"
                        }`}
                      >
                        {Number(totalScore ?? 0).toLocaleString()}
                      </span>

                      {activeTab === "aws" && (
                        <span className="mt-1 text-xs text-[#220849]/50">
                          / 18
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {activeTab === "aws" && (
            <Link
              href="/aws-quiz"
              className="rounded-xl bg-[#5f2396] hover:bg-[#220849] text-white px-6 py-4 font-bold transition-all shadow-lg"
            >
              Play AWS Cloud Quest
            </Link>
          )}

          <Link
            href="/dashboard"
            className="rounded-xl bg-[#220849] hover:bg-[#5f2396] text-white px-8 py-4 font-bold transition-all shadow-lg"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
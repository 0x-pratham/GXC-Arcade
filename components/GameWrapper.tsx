// components/GameWrapper.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { deductGameCredit } from "../lib/actions";
import { Play, AlertCircle, Zap, RefreshCcw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface GameWrapperProps {
  gameId: string;
  gameTitle: string;
  children: (onGameOver: (score: number) => void, onPlayAgain: () => void) => React.ReactNode;
}

export default function GameWrapper({ gameId, gameTitle, children }: GameWrapperProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<number | null>(null);
  
  // Game States: 'idle' (waiting to start), 'playing', 'gameover'
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      setUser(session.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", session.user.id)
        .single();
        
      if (profile) setCredits(profile.credits);
      setLoading(false);
    };
    init();
  }, [router]);

  // Start ya Play Again logic
  const handleStartSequence = async () => {
    if (!user) return;
    setStarting(true);

    const result = await deductGameCredit(user.id);
    
    if (result.success) {
      setCredits(result.remaining);
      setGameState('playing');
    } else {
      alert("Insufficient Credits! Please top up to play.");
    }
    setStarting(false);
  };

  const handleGameOver = async (score: number) => {
    setFinalScore(score);
    setGameState('gameover');
    
    // (Optional) Yahan leaderboard par score save karne ka API call kar sakte hain
    if (user) {
      await supabase.from("scores").insert([
        { game_id: gameId, user_id: user.id, score: score }
      ]);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#e2d4f8] border-t-[#5f2396] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 relative z-20">
      
      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#220849]/60 hover:text-[#5f2396] font-bold text-sm transition-colors">
          <ArrowLeft size={18} />
          Back to Hub
        </Link>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#c7a6f3]/30">
          <Zap size={16} className="text-[#5f2396]" />
          <span className="font-bold text-[#220849] text-sm">Credits: {credits}</span>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-[#c7a6f3]/40 shadow-sm p-6 md:p-10 min-h-[500px] flex flex-col relative overflow-hidden">
        
        {/* STATE 1: IDLE (Start Screen) */}
        {gameState === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl md:text-5xl font-black font-heading text-[#220849] mb-4">
              {gameTitle}
            </h1>
            <p className="text-[#220849]/60 font-medium mb-12 max-w-md">
              Execution requires 1 Credit. Your current balance is {credits} credits.
            </p>
            
            {credits && credits > 0 ? (
              <button 
                onClick={handleStartSequence}
                disabled={starting}
                className="bg-[#220849] hover:bg-[#5f2396] text-white px-10 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3 shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {starting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Play size={20} fill="currentColor" />
                )}
                {starting ? "Initializing..." : "Start Game (-1 Credit)"}
              </button>
            ) : (
              <div className="bg-red-50 text-red-600 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 border border-red-200">
                <AlertCircle size={20} />
                Insufficient Credits
              </div>
            )}
          </div>
        )}

        {/* STATE 2: PLAYING (Actual Game Component) */}
        {gameState === 'playing' && (
          <div className="flex-1 flex flex-col w-full h-full">
             {/* Yahan aapka actual game render hoga aur use hum handleGameOver pass karenge */}
             {children(handleGameOver, handleStartSequence)}
          </div>
        )}

        {/* STATE 3: GAME OVER */}
        {gameState === 'gameover' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
            <h2 className="text-2xl font-bold text-[#220849]/60 uppercase tracking-widest mb-2 font-mono">
              Module Complete
            </h2>
            <div className="text-6xl md:text-8xl font-black text-[#5f2396] font-heading mb-12">
              {finalScore}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              {credits && credits > 0 ? (
                <button 
                  onClick={handleStartSequence}
                  disabled={starting}
                  className="flex-1 bg-[#5f2396] hover:bg-[#220849] text-white px-6 py-4 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-md disabled:opacity-70"
                >
                  {starting ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                     <RefreshCcw size={18} />
                  )}
                  Play Again (-1 Credit)
                </button>
              ) : (
                <div className="flex-1 bg-gray-100 text-gray-500 px-6 py-4 rounded-xl font-bold flex justify-center items-center gap-2 border border-gray-200 cursor-not-allowed">
                  <AlertCircle size={18} />
                  Out of Credits
                </div>
              )}
              
              <Link href="/dashboard" className="flex-1 bg-white hover:bg-[#f4effc] text-[#220849] border border-[#c7a6f3]/50 px-6 py-4 rounded-xl font-bold transition-all flex justify-center items-center">
                Exit to Hub
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
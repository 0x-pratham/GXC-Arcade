// components/TargetTap.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bomb } from "lucide-react";

interface TargetTapProps {
  onGameOver: (score: number) => void;
}

export default function TargetTap({ onGameOver }: TargetTapProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hasEnded, setHasEnded] = useState(false);
  
  // Stats
  const [clicks, setClicks] = useState(0);
  const [hits, setHits] = useState(0);

  // Entities Positions
  const [targetPos, setTargetPos] = useState({ top: 50, left: 50 });
  const [bombPos, setBombPos] = useState<{ top: number, left: number } | null>(null);
  
  const [missPenalty, setMissPenalty] = useState(false); // For background flash

  const lastSpawnTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Spawn logic with overlap prevention
  const spawnEntities = useCallback(() => {
    // 1. Spawn Primary Target
    const newTargetTop = Math.floor(Math.random() * 70) + 10;
    const newTargetLeft = Math.floor(Math.random() * 75) + 10;
    setTargetPos({ top: newTargetTop, left: newTargetLeft });
    
    lastSpawnTimeRef.current = performance.now();

    // 2. 25% Chance to spawn a Bomb (Explosive)
    if (Math.random() > 0.75) {
      let newBombTop = Math.floor(Math.random() * 70) + 10;
      let newBombLeft = Math.floor(Math.random() * 75) + 10;
      
      // Ensure bomb doesn't overlap the target (keep them at least 20% apart)
      while (
        Math.abs(newBombTop - newTargetTop) < 20 && 
        Math.abs(newBombLeft - newTargetLeft) < 20
      ) {
        newBombTop = Math.floor(Math.random() * 70) + 10;
        newBombLeft = Math.floor(Math.random() * 75) + 10;
      }
      setBombPos({ top: newBombTop, left: newBombLeft });
    } else {
      setBombPos(null);
    }
  }, []);

  // Initialize Game on Mount
  useEffect(() => {
    setScore(0);
    setClicks(0);
    setHits(0);
    setTimeLeft(30);
    setHasEnded(false);
    spawnEntities();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [spawnEntities]);

  // Handle Regular Game Over (Time's Up)
  useEffect(() => {
    if (timeLeft === 0 && !hasEnded) {
      setHasEnded(true);
      
      const accuracyMultiplier = clicks > 0 ? (hits / clicks) : 0;
      const finalScore = Math.floor(score * accuracyMultiplier);

      if (typeof onGameOver === "function") {
        setTimeout(() => onGameOver(finalScore), 400); // Slight delay for UX
      } else {
        console.error("CRITICAL: onGameOver function is missing in TargetTap!");
      }
    }
  }, [timeLeft, hasEnded, score, hits, clicks, onGameOver]);

  // Handle Target Hit
  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (timeLeft === 0 || hasEnded) return;

    const reactionTime = performance.now() - lastSpawnTimeRef.current;
    
    // Score Logic: Base 500 + Speed Bonus (Max 1000)
    const speedBonus = Math.max(0, Math.floor(1000 - reactionTime));
    const pointsGained = 500 + speedBonus;

    setScore((prev) => prev + pointsGained);
    setHits((prev) => prev + 1);
    setClicks((prev) => prev + 1);
    
    spawnEntities(); 
  };

  // 💣 Handle Bomb Hit (INSTANT GAME OVER)
  const handleBombClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timeLeft === 0 || hasEnded) return;

    setHasEnded(true);
    setBombPos(null); // Hide bomb
    setTargetPos({ top: -100, left: -100 }); // Hide target

    // Send final score with a massive penalty (or just 0)
    const accuracyMultiplier = clicks > 0 ? (hits / clicks) : 0;
    const finalScore = Math.max(0, Math.floor((score * accuracyMultiplier) - 5000));

    if (typeof onGameOver === "function") {
      setTimeout(() => onGameOver(finalScore), 1000); // Give 1s to see the explosion UI
    }
  };

  // Handle Miss (Background Hit)
  const handleBackgroundClick = () => {
    if (timeLeft === 0 || hasEnded) return;
    
    setClicks((prev) => prev + 1);
    setScore((prev) => Math.max(0, prev - 200)); 
    
    // Flash red
    setMissPenalty(true);
    setTimeout(() => setMissPenalty(false), 200);
  };

  const accuracy = clicks > 0 ? Math.round((hits / clicks) * 100) : 0;

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center p-2 sm:p-4">
      
      {/* 📊 HUD (Mobile Optimized Glassmorphism) */}
      <div className="w-full flex justify-between items-center z-10 mb-6">
        <div className="bg-white/70 backdrop-blur-xl px-4 py-2.5 sm:px-5 sm:py-3 rounded-[1.25rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white flex items-center gap-3 sm:gap-4">
          <span className="text-[#220849]/50 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
            Time <span className={`ml-1 text-xs sm:text-sm ${timeLeft <= 5 ? "text-rose-500 animate-pulse" : "text-[#220849]"}`}>{timeLeft}s</span>
          </span>
          <div className="w-px h-4 bg-[#220849]/10"></div>
          <span className="text-[#220849]/50 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
            Acc <span className="ml-1 text-xs sm:text-sm text-[#220849]">{accuracy}%</span>
          </span>
        </div>
        <div className="bg-white/70 backdrop-blur-xl px-4 py-2.5 sm:px-5 sm:py-3 rounded-[1.25rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
          <span className="text-[#220849]/50 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
            Score <span className="ml-1 text-xs sm:text-sm text-[#5f2396]">{score}</span>
          </span>
        </div>
      </div>

      {/* 🎮 Game Area */}
      <motion.div 
        onClick={handleBackgroundClick}
        animate={{ backgroundColor: missPenalty ? "rgba(244, 63, 94, 0.2)" : "rgba(255, 255, 255, 0.4)" }}
        transition={{ duration: 0.2 }}
        className="flex-1 w-full max-w-lg mx-auto backdrop-blur-md rounded-[2rem] border border-white/60 relative overflow-hidden cursor-crosshair shadow-[0_10px_30px_rgba(199,166,243,0.15)]"
      >
        <AnimatePresence>
          {!hasEnded && (
            <motion.div
              key={`target-${targetPos.top}-${targetPos.left}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              onClick={handleTargetClick}
              className="absolute w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center cursor-pointer"
              style={{ top: `${targetPos.top}%`, left: `${targetPos.left}%` }}
            >
              {/* Premium Digital Bullseye */}
              <div className="w-full h-full bg-[#5f2396] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(95,35,150,0.4)] border-[3px] border-white/80">
                <div className="w-1/2 h-1/2 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <div className="w-1/2 h-1/2 bg-[#220849] rounded-full" />
                </div>
              </div>
            </motion.div>
          )}

          {/* 💣 The Explosive Decoy */}
          {!hasEnded && bombPos && (
            <motion.div
              key={`bomb-${bombPos.top}-${bombPos.left}`}
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={handleBombClick}
              className="absolute w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center cursor-pointer"
              style={{ top: `${bombPos.top}%`, left: `${bombPos.left}%` }}
            >
              {/* Bomb UI */}
              <div className="w-full h-full bg-[#110320] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.6)] border-2 border-rose-500/50">
                <Bomb size={24} className="text-rose-500 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fatal Error Overlay (If Bomb is clicked) */}
        {hasEnded && timeLeft > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-rose-500/20 backdrop-blur-sm z-20"
          >
            <Bomb size={64} className="text-rose-600 mb-4 drop-shadow-lg" />
            <span className="bg-rose-600 text-white px-6 py-2 rounded-full font-mono text-lg md:text-xl font-black uppercase tracking-widest shadow-xl">
              Fatal Detonation
            </span>
          </motion.div>
        )}

        {/* Start Hint Overlay (Fades out quickly) */}
        {timeLeft === 30 && !hasEnded && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-10 w-full flex justify-center pointer-events-none"
          >
            <span className="bg-[#220849]/10 backdrop-blur-md px-5 py-2.5 rounded-full font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#220849]/60 shadow-sm border border-white/50">
              Tap targets. Avoid explosives.
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
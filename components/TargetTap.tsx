// components/TargetTap.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  // Target Position (Percentage based for responsiveness)
  const [targetPos, setTargetPos] = useState({ top: 50, left: 50 });
  const lastSpawnTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Move target to a new random location
  const spawnTarget = useCallback(() => {
    // Keep target within 10% to 85% to avoid clipping out of bounds
    const newTop = Math.floor(Math.random() * 75) + 10;
    const newLeft = Math.floor(Math.random() * 75) + 10;
    setTargetPos({ top: newTop, left: newLeft });
    lastSpawnTimeRef.current = performance.now();
  }, []);

  // Initialize Game on Mount
  useEffect(() => {
    setScore(0);
    setClicks(0);
    setHits(0);
    setTimeLeft(30);
    setHasEnded(false);
    spawnTarget();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0; // Trigger game over in next effect
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [spawnTarget]);

  // Handle Game Over Logically
  useEffect(() => {
    if (timeLeft === 0 && !hasEnded) {
      setHasEnded(true);
      
      // Calculate final arcade score (Score * Accuracy %)
      const accuracyMultiplier = clicks > 0 ? (hits / clicks) : 0;
      const finalScore = Math.floor(score * accuracyMultiplier);

      if (typeof onGameOver === "function") {
        onGameOver(finalScore);
      } else {
        console.error("CRITICAL: onGameOver function is missing in TargetTap!");
      }
    }
  }, [timeLeft, hasEnded, score, hits, clicks, onGameOver]);

  // Handle successful hit on the target
  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent background click from firing
    if (timeLeft === 0 || hasEnded) return;

    const reactionTime = performance.now() - lastSpawnTimeRef.current;
    
    // Score Logic: Base 500 + Speed Bonus (Faster = More Points, Max 1000)
    const speedBonus = Math.max(0, Math.floor(1000 - reactionTime));
    const pointsGained = 500 + speedBonus;

    setScore((prev) => prev + pointsGained);
    setHits((prev) => prev + 1);
    setClicks((prev) => prev + 1);
    
    spawnTarget(); // Instantly spawn next target
  };

  // Handle miss (clicking the background)
  const handleBackgroundClick = () => {
    if (timeLeft === 0 || hasEnded) return;
    
    setClicks((prev) => prev + 1);
    // Penalty for missing
    setScore((prev) => Math.max(0, prev - 200)); 
  };

  const accuracy = clicks > 0 ? Math.round((hits / clicks) * 100) : 0;

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-between p-2">
      
      {/* Header HUD */}
      <div className="w-full flex justify-between items-center z-10 mb-6">
        <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-xl border border-[#c7a6f3]/50 shadow-sm flex gap-4">
          <span className="text-[#220849] font-bold text-sm tracking-widest uppercase">
            Time <span className={`ml-2 ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-[#5f2396]"}`}>{timeLeft}s</span>
          </span>
          <span className="text-[#220849] font-bold text-sm tracking-widest uppercase hidden sm:inline border-l border-[#c7a6f3]/30 pl-4">
            Acc <span className="ml-2 text-[#5f2396]">{accuracy}%</span>
          </span>
        </div>
        <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-xl border border-[#c7a6f3]/50 shadow-sm">
          <span className="text-[#220849] font-bold text-sm tracking-widest uppercase">
            Score <span className="ml-2 text-[#5f2396]">{score}</span>
          </span>
        </div>
      </div>

      {/* Game Area */}
      <div 
        onClick={handleBackgroundClick}
        className="flex-1 w-full bg-white/40 backdrop-blur-sm rounded-[2rem] border border-[#c7a6f3]/40 relative overflow-hidden cursor-crosshair shadow-inner"
      >
        <AnimatePresence>
          {!hasEnded && (
            <motion.div
              key={`${targetPos.top}-${targetPos.left}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={handleTargetClick}
              className="absolute w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
              style={{ top: `${targetPos.top}%`, left: `${targetPos.left}%` }}
            >
              {/* Bullseye Design */}
              <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.5)] border-2 border-white/20">
                <div className="w-3/4 h-3/4 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <div className="w-1/2 h-1/2 bg-red-500 rounded-full shadow-sm" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Hint Overlay (Fades out quickly) */}
        <motion.div 
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <span className="bg-[#220849]/10 px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest text-[#220849]/50">
            Click targets. Don't miss.
          </span>
        </motion.div>
      </div>
    </div>
  );
}
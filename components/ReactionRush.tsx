// components/ReactionRush.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface ReactionRushProps {
  onGameOver: (score: number) => void;
}

type GameState = "sequence" | "ready_to_drop" | "go" | "finished" | "jump_start";

export default function ReactionRush({ onGameOver }: ReactionRushProps) {
  const [gameState, setGameState] = useState<GameState>("sequence");
  const [activeColumns, setActiveColumns] = useState<number>(0);
  const [displayTime, setDisplayTime] = useState<string>("00.000");
  const [hasEnded, setHasEnded] = useState(false);
  
  const sequenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dropTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Stop all timers safely
  const clearAllTimers = useCallback(() => {
    if (sequenceIntervalRef.current) clearInterval(sequenceIntervalRef.current);
    if (dropTimeoutRef.current) clearTimeout(dropTimeoutRef.current);
  }, []);

  // Initialize Game on Mount
  useEffect(() => {
    clearAllTimers();
    setGameState("sequence");
    setActiveColumns(0);
    setDisplayTime("00.000");
    setHasEnded(false);

    let count = 0;
    // Har 1 second me ek light column on hoga
    sequenceIntervalRef.current = setInterval(() => {
      count++;
      setActiveColumns(count);
      
      if (count === 5) {
        if (sequenceIntervalRef.current) clearInterval(sequenceIntervalRef.current);
        setGameState("ready_to_drop");
        
        // 5 lights on hone ke baad random delay (0.2s to 3s)
        const randomDelay = Math.random() * 2800 + 200;
        
        dropTimeoutRef.current = setTimeout(() => {
          setActiveColumns(0); // Lights GO OUT!
          setGameState("go");
          startTimeRef.current = performance.now(); // High precision timer
        }, randomDelay);
      }
    }, 1000);

    return () => clearAllTimers();
  }, [clearAllTimers]);

  const handleAction = useCallback(() => {
    if (hasEnded) return;

    if (gameState === "sequence" || gameState === "ready_to_drop") {
      // User reacted before lights went out (Jump Start / False Start)
      clearAllTimers();
      setGameState("jump_start");
      setActiveColumns(0);
      setDisplayTime("FAULT");
      setHasEnded(true);

      // Trigger Game Over with 0 Score after 1.5 seconds
      setTimeout(() => {
        if (typeof onGameOver === "function") {
          onGameOver(0);
        } else {
          console.error("CRITICAL: onGameOver function is missing!");
        }
      }, 1500);

    } else if (gameState === "go") {
      // Perfect reaction!
      const endTime = performance.now();
      const timeTaken = endTime - startTimeRef.current;
      
      setGameState("finished");
      setHasEnded(true);
      
      // Format time as 00.XXX (e.g., 00.245)
      const formattedTime = (timeTaken / 1000).toFixed(3).padStart(6, '0');
      setDisplayTime(formattedTime);

      // Score calculation for DB (Faster time = higher score)
      const calculatedScore = Math.max(0, Math.floor(10000 - timeTaken));
      
      // Trigger Game Over after showing time for 1.5 seconds
      setTimeout(() => {
        if (typeof onGameOver === "function") {
          onGameOver(calculatedScore);
        } else {
          console.error("CRITICAL: onGameOver function is missing!");
        }
      }, 1500);
    }
  }, [gameState, hasEnded, clearAllTimers, onGameOver]);

  // Spacebar integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // Prevent page scroll down
        handleAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]);

  return (
    <div 
      onClick={handleAction}
      className="w-full h-full min-h-[450px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-[2rem] border border-[#c7a6f3]/30 cursor-pointer select-none relative overflow-hidden shadow-inner p-4"
    >
      <div className="absolute top-4 left-0 w-full text-center opacity-40 text-[10px] font-mono tracking-widest uppercase">
        Tap screen or press SPACE
      </div>

      {/* Lights Container (F1 style: Dark block with circular slots) */}
      <div className="bg-[#110320] p-4 md:p-6 rounded-[2rem] flex gap-2 md:gap-4 shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-[#5f2396]/30">
        {[1, 2, 3, 4, 5].map((col) => (
          <div key={col} className="flex flex-col gap-2 md:gap-4">
            {[1, 2, 3, 4].map((row) => (
              <motion.div
                key={`${col}-${row}`}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-black border-2 border-white/5"
                animate={{
                  backgroundColor: activeColumns >= col ? "#ef4444" : "#0a0a0a", // Red when active, near-black when off
                  boxShadow: activeColumns >= col ? "0 0 25px 8px rgba(239, 68, 68, 0.4)" : "inset 0 4px 10px rgba(0,0,0,0.8)",
                  borderColor: activeColumns >= col ? "#fca5a5" : "rgba(255,255,255,0.05)"
                }}
                transition={{ duration: 0.05 }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Main Instruction Text */}
      <div className="mt-10 text-center h-8">
        <p className={`font-bold text-sm md:text-base tracking-wide uppercase font-mono ${
          gameState === "jump_start" ? "text-red-500" : 
          gameState === "go" ? "text-green-600" : "text-[#5f2396]"
        }`}>
          {(gameState === "sequence" || gameState === "ready_to_drop") && "Wait for lights to go out..."}
          {gameState === "go" && "GO! TAP NOW!"}
          {gameState === "jump_start" && "FAULT! Jump start detected."}
          {gameState === "finished" && "Time Logged!"}
        </p>
      </div>

      {/* Big Timer Display */}
      <div className="mt-4 text-center bg-white/80 px-8 py-4 rounded-2xl border border-[#c7a6f3]/50 shadow-sm">
        <h1 className={`text-5xl md:text-7xl font-mono tracking-tighter tabular-nums font-black ${
          gameState === "jump_start" ? "text-red-500" : "text-[#220849]"
        }`}>
          {displayTime}
        </h1>
      </div>
    </div>
  );
}
// components/ReactionRush.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertCircle } from "lucide-react";

interface ReactionRushProps {
  onGameOver: (score: number) => void;
}

type GameState = "sequence" | "ready_to_drop" | "go" | "finished" | "jump_start";

export default function ReactionRush({ onGameOver }: ReactionRushProps) {
  const [gameState, setGameState] = useState<GameState>("sequence");
  const [activeLights, setActiveLights] = useState<number>(0);
  const [displayTime, setDisplayTime] = useState<string>("00.000");
  const [hasEnded, setHasEnded] = useState(false);
  
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Stop all timers safely
  const clearAllTimers = useCallback(() => {
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current);
    if (dropTimeoutRef.current) clearTimeout(dropTimeoutRef.current);
  }, []);

  // 🧠 THE ANXIETY ENGINE: Variable Timing Algorithm
  const playSequence = useCallback((currentLight: number) => {
    setActiveLights(currentLight);

    if (currentLight === 5) {
      setGameState("ready_to_drop");
      
      // The Drop Delay: 80% normal (0.2s - 1.5s), 20% Agonizing Wait (1.5s - 3.5s) to force jump starts
      const isAgonizing = Math.random() > 0.8;
      const dropDelay = isAgonizing 
        ? Math.random() * 2000 + 1500 
        : Math.random() * 1300 + 200;
      
      dropTimeoutRef.current = setTimeout(() => {
        setActiveLights(0); // LIGHTS OUT!
        setGameState("go");
        startTimeRef.current = performance.now();
      }, dropDelay);

    } else {
      // The Fill Rhythm: Sometimes steady, sometimes glitchy/irregular
      const isGlitchy = Math.random() > 0.7; 
      const nextDelay = isGlitchy ? (Math.random() * 700 + 300) : 800; // Normal is ~800ms

      sequenceTimeoutRef.current = setTimeout(() => {
        playSequence(currentLight + 1);
      }, nextDelay);
    }
  }, []);

  // Initialize Game on Mount
  useEffect(() => {
    clearAllTimers();
    setGameState("sequence");
    setActiveLights(0);
    setDisplayTime("00.000");
    setHasEnded(false);

    // Start the light sequence after a short initial pause
    sequenceTimeoutRef.current = setTimeout(() => {
      playSequence(1);
    }, 1000);

    return () => clearAllTimers();
  }, [clearAllTimers, playSequence]);

  const handleAction = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault(); // Prevent double firing on mobile
    if (hasEnded) return;

    if (gameState === "sequence" || gameState === "ready_to_drop") {
      // ❌ FALSE START
      clearAllTimers();
      setGameState("jump_start");
      setActiveLights(5); // Freeze lights
      setDisplayTime("FAULT");
      setHasEnded(true);

      setTimeout(() => {
        if (typeof onGameOver === "function") {
          onGameOver(0); // 0 Score for jump start
        }
      }, 1500);

    } else if (gameState === "go") {
      // ✅ PERFECT REACTION
      const endTime = performance.now();
      const timeTaken = endTime - startTimeRef.current;
      
      setGameState("finished");
      setHasEnded(true);
      
      // Format time as 00.XXX (e.g., 00.245)
      const formattedTime = (timeTaken / 1000).toFixed(3).padStart(6, '0');
      setDisplayTime(formattedTime);

      // Score calculation: Faster time = exponentially higher score
      const calculatedScore = Math.max(0, Math.floor(10000 - (timeTaken * 1.5)));
      
      setTimeout(() => {
        if (typeof onGameOver === "function") {
          onGameOver(calculatedScore);
        }
      }, 1500);
    }
  }, [gameState, hasEnded, clearAllTimers, onGameOver]);

  // Keyboard integration (Spacebar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction]);

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-4 sm:p-6">
      
      {/* 🎮 The Main Interactive Canvas (Full screen tap target for mobile) */}
      <motion.div 
        whileTap={{ scale: hasEnded ? 1 : 0.98 }}
        onPointerDown={handleAction}
        className={`w-full max-w-lg mx-auto aspect-square sm:aspect-[4/3] flex flex-col items-center justify-between p-6 sm:p-10 rounded-[2.5rem] cursor-pointer shadow-[0_15px_40px_rgba(0,0,0,0.06)] border transition-colors duration-300 relative overflow-hidden ${
          gameState === "jump_start" ? "bg-rose-50 border-rose-200" :
          gameState === "go" || gameState === "finished" ? "bg-green-50 border-green-200" :
          "bg-white/60 backdrop-blur-xl border-white/80"
        }`}
      >
        
        {/* Dynamic Background Glow */}
        <div className={`absolute inset-0 opacity-20 transition-opacity duration-500 ${
          gameState === "jump_start" ? "bg-gradient-to-t from-rose-500 to-transparent" :
          gameState === "go" || gameState === "finished" ? "bg-gradient-to-t from-green-500 to-transparent" :
          "bg-gradient-to-t from-[#c7a6f3] to-transparent"
        }`} />

        {/* Minimal Header */}
        <div className="z-10 text-center">
          <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-[#220849]/60 shadow-sm">
            Reaction Module
          </span>
        </div>

        {/* 🚦 The Luxury Lights (Sleek Horizontal Array) */}
        <div className="w-full flex justify-center gap-2 sm:gap-4 z-10 my-8">
          {[1, 2, 3, 4, 5].map((lightNum) => (
            <motion.div
              key={lightNum}
              animate={{
                backgroundColor: activeLights >= lightNum 
                  ? (gameState === "jump_start" ? "#f43f5e" : "#ef4444") // Rose on fault, Red normally
                  : "rgba(0,0,0,0.05)",
                scale: activeLights >= lightNum ? 1.05 : 1,
              }}
              transition={{ duration: 0.1, type: "spring", stiffness: 300 }}
              className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-shadow ${
                activeLights >= lightNum 
                  ? "border-rose-400/50 shadow-[0_0_30px_rgba(239,68,68,0.6)]" 
                  : "border-[#220849]/10 shadow-inner"
              }`}
            >
              {/* Inner Bulb Core */}
              <div className={`w-1/2 h-1/2 rounded-full transition-colors ${
                activeLights >= lightNum ? "bg-white/80" : "bg-transparent"
              }`} />
            </motion.div>
          ))}
        </div>

        {/* ⏱️ Precision Timer Display */}
        <div className="z-10 flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.h1 
              key={displayTime}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter tabular-nums drop-shadow-sm ${
                gameState === "jump_start" ? "text-rose-600" : 
                gameState === "finished" ? "text-green-600" : 
                "text-[#220849]"
              }`}
            >
              {displayTime}
            </motion.h1>
          </AnimatePresence>

          {/* Contextual Feedback Text */}
          <div className="mt-4 h-6 flex items-center justify-center">
            {gameState === "sequence" || gameState === "ready_to_drop" ? (
              <span className="flex items-center gap-2 text-[#220849]/50 font-bold text-xs sm:text-sm uppercase tracking-widest">
                Wait for lights out...
              </span>
            ) : gameState === "go" ? (
              <span className="flex items-center gap-2 text-green-600 font-bold text-xs sm:text-sm uppercase tracking-widest animate-pulse">
                <Zap size={16} /> Tap Now!
              </span>
            ) : gameState === "jump_start" ? (
              <span className="flex items-center gap-2 text-rose-600 font-bold text-xs sm:text-sm uppercase tracking-widest">
                <AlertCircle size={16} /> False Start
              </span>
            ) : (
              <span className="text-[#220849]/50 font-bold text-xs sm:text-sm uppercase tracking-widest">
                Reaction Recorded
              </span>
            )}
          </div>
        </div>

      </motion.div>

      {/* Mobile-only hint */}
      <div className="mt-6 text-center opacity-40 md:hidden">
        <p className="text-[10px] uppercase font-bold tracking-widest text-[#220849]">
          Tap anywhere on the card
        </p>
      </div>
    </div>
  );
}
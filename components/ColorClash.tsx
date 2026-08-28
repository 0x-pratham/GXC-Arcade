// components/ColorClash.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ColorClashProps {
  onGameOver: (score: number) => void;
}

const COLORS = [
  { name: "RED", hex: "#ef4444" },
  { name: "BLUE", hex: "#3b82f6" },
  { name: "GREEN", hex: "#22c55e" },
  { name: "YELLOW", hex: "#eab308" },
  { name: "PURPLE", hex: "#a855f7" },
  { name: "ORANGE", hex: "#f97316" }
];

export default function ColorClash({ onGameOver }: ColorClashProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  
  // Current Round Data
  const [targetWord, setTargetWord] = useState(COLORS[0]);
  const [targetPaint, setTargetPaint] = useState(COLORS[1]);
  const [options, setOptions] = useState<typeof COLORS>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateRound = useCallback(() => {
    const wordIndex = Math.floor(Math.random() * COLORS.length);
    const word = COLORS[wordIndex];
    
    let paintIndex = Math.floor(Math.random() * COLORS.length);

    while (paintIndex === wordIndex) {
      paintIndex = Math.floor(Math.random() * COLORS.length);
    }

    const paint = COLORS[paintIndex];

    const newOptions = [word];

    while (newOptions.length < 4) {
      const randomOption =
        COLORS[Math.floor(Math.random() * COLORS.length)];

      if (!newOptions.find(o => o.name === randomOption.name)) {
        newOptions.push(randomOption);
      }
    }
    
    setOptions(newOptions.sort(() => Math.random() - 0.5));
    setTargetWord(word);
    setTargetPaint(paint);
  }, []);

  // Initialize Game on Mount
  useEffect(() => {
    generateRound();
    setScore(0);
    setTimeLeft(15);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          return 0; // Trigger game over in next effect
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [generateRound]);

  // Handle Game Over
  useEffect(() => {
    if (timeLeft === 0) {
      if (typeof onGameOver === "function") {
        onGameOver(score);
      } else {
        console.error(
          "CRITICAL: onGameOver function is missing! Make sure it is passed from GameWrapper."
        );
      }
    }
  }, [timeLeft, score, onGameOver]);

  const handleOptionClick = (clickedColor: typeof COLORS[0]) => {
    if (timeLeft === 0) return;

    if (clickedColor.name === targetWord.name) {
      // Correct!
      setScore((prev) => prev + 100 + (timeLeft * 5));
      generateRound();
    } else {
      // Wrong! Penalty
      setTimeLeft((prev) => Math.max(0, prev - 2));
      generateRound();
    }
  };

  return (
    <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-between p-2">
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-center z-10 mb-8">
        <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-xl border border-[#c7a6f3]/50 shadow-sm">
          <span className="text-[#220849] font-bold text-sm tracking-widest uppercase">
            Time{" "}
            <span
              className={`ml-2 ${
                timeLeft <= 3
                  ? "text-red-500 animate-pulse"
                  : "text-[#5f2396]"
              }`}
            >
              {timeLeft}s
            </span>
          </span>
        </div>

        <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-xl border border-[#c7a6f3]/50 shadow-sm">
          <span className="text-[#220849] font-bold text-sm tracking-widest uppercase">
            Score{" "}
            <span className="ml-2 text-[#5f2396]">
              {score}
            </span>
          </span>
        </div>
      </div>

      {/* Gameplay Area */}
      <div className="w-full flex flex-col items-center gap-8 flex-1 justify-center">
        
        {/* The Word */}
        <div className="bg-white/80 backdrop-blur-sm w-full max-w-sm py-10 rounded-[2rem] border border-[#c7a6f3]/30 shadow-[0_10px_30px_rgba(199,166,243,0.15)] text-center relative overflow-hidden">
          
          <div className="absolute top-2 left-0 w-full text-center opacity-30 text-[10px] font-mono tracking-widest uppercase">
            Target Vector
          </div>

          <h1
            style={{ color: targetPaint.hex }}
            className="text-5xl md:text-6xl font-black font-heading tracking-widest uppercase drop-shadow-sm mt-2"
          >
            {targetWord.name}
          </h1>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <AnimatePresence mode="popLayout">
            {options.map((option, idx) => (
              <motion.button
                key={`${option.name}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOptionClick(option)}
                style={{ backgroundColor: option.hex }}
                className="h-24 md:h-28 rounded-2xl shadow-[0_5px_15px_rgba(0,0,0,0.1)] border-4 border-white/30 flex items-center justify-center hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-shadow"
              >
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
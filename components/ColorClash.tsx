// components/ColorClash.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ColorClashProps {
  onGameOver: (score: number) => void;
}

// Sophisticated, slightly muted premium palette
const COLORS = [
  { name: "RED", hex: "#f43f5e" },     // Rose
  { name: "BLUE", hex: "#3b82f6" },    // Azure
  { name: "GREEN", hex: "#10b981" },   // Emerald
  { name: "YELLOW", hex: "#eab308" },  // Amber/Yellow
  { name: "PURPLE", hex: "#a855f7" },  // Amethyst
  { name: "ORANGE", hex: "#f97316" }   // Orange
];

type RuleType = "TEXT" | "INK";

export default function ColorClash({ onGameOver }: ColorClashProps) {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(20);
  const [hasEnded, setHasEnded] = useState(false);
  
  // Game Logic State
  const [targetWord, setTargetWord] = useState(COLORS[0]);
  const [targetPaint, setTargetPaint] = useState(COLORS[1]);
  const [options, setOptions] = useState<typeof COLORS>([]);
  const [currentRule, setCurrentRule] = useState<RuleType>("TEXT");
  const [wobbleError, setWobbleError] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateRound = useCallback(() => {
    // 🧠 Cognitive Shift Algorithm
    const newRule: RuleType = Math.random() > 0.5 ? "TEXT" : "INK";
    setCurrentRule(newRule);

    const wordIndex = Math.floor(Math.random() * COLORS.length);
    const word = COLORS[wordIndex];
    
    let paintIndex = Math.floor(Math.random() * COLORS.length);
    while (paintIndex === wordIndex) {
      paintIndex = Math.floor(Math.random() * COLORS.length);
    }
    const paint = COLORS[paintIndex];

    const correctColor = newRule === "TEXT" ? word : paint;
    const trickColor = newRule === "TEXT" ? paint : word;

    const newOptions = [correctColor];
    if (!newOptions.find(o => o.name === trickColor.name)) {
      newOptions.push(trickColor);
    }

    while (newOptions.length < 4) {
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (!newOptions.find(o => o.name === randomColor.name)) {
        newOptions.push(randomColor);
      }
    }
    
    setOptions(newOptions.sort(() => Math.random() - 0.5));
    setTargetWord(word);
    setTargetPaint(paint);
  }, []);

  useEffect(() => {
    generateRound();
    setScore(0);
    setCombo(1);
    setTimeLeft(20);
    setHasEnded(false);

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
  }, [generateRound]);

  useEffect(() => {
    if (timeLeft === 0 && !hasEnded) {
      setHasEnded(true);
      if (typeof onGameOver === "function") {
        setTimeout(() => onGameOver(score), 500); 
      }
    }
  }, [timeLeft, score, onGameOver, hasEnded]);

  const handleOptionClick = (clickedColor: typeof COLORS[0]) => {
    if (timeLeft === 0 || hasEnded) return;

    const isCorrect = currentRule === "TEXT" 
      ? clickedColor.name === targetWord.name 
      : clickedColor.name === targetPaint.name;

    if (isCorrect) {
      // ✅ Smooth Progression
      setScore((prev) => prev + (100 * combo));
      setCombo((prev) => prev + 1);
      generateRound();
    } else {
      // ❌ Minimal Error Feedback
      setCombo(1);
      setWobbleError(true);
      setTimeout(() => setWobbleError(false), 300);
      
      setTimeLeft((prev) => Math.max(0, prev - 2)); 
      generateRound(); 
    }
  };

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-between p-4 sm:p-6 bg-transparent">
      
      {/* 📊 HUD: Naked Typography, No Bulky Boxes */}
      <div className="w-full flex justify-between items-center z-10 font-mono">
        <div className="flex flex-col">
          <span className="text-[#220849]/40 text-[10px] font-bold tracking-[0.2em] uppercase">
            Time Remaining
          </span>
          <span className={`text-2xl sm:text-3xl font-light tracking-tighter ${timeLeft <= 5 ? "text-rose-500 animate-pulse" : "text-[#220849]"}`}>
            {timeLeft}<span className="text-sm text-[#220849]/40 ml-1">SEC</span>
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[#220849]/40 text-[10px] font-bold tracking-[0.2em] uppercase">
            Current Score
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-light tracking-tighter text-[#5f2396]">
              {score.toLocaleString()}
            </span>
            <AnimatePresence>
              {combo > 1 && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs sm:text-sm font-black text-rose-500 tracking-tighter"
                >
                  x{combo}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 🎮 Game Area: Floating Elements */}
      <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center gap-12 sm:gap-16">
        
        {/* Floating Target & Subtle Rule */}
        <motion.div 
          animate={{ x: wobbleError ? [-8, 8, -8, 8, 0] : 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center justify-center relative w-full h-32"
        >
          {/* Subtle Changing Rule */}
          <motion.div 
            key={currentRule}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`absolute top-0 text-[10px] sm:text-xs font-mono font-black tracking-[0.3em] uppercase transition-colors ${
              currentRule === "TEXT" ? "text-[#5f2396]" : "text-rose-500"
            }`}
          >
            [ IDENTIFY {currentRule} ]
          </motion.div>

          {/* The Target Word */}
          <AnimatePresence mode="wait">
            <motion.h1 
              key={targetWord.name + targetPaint.name + currentRule}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.15 }}
              style={{ color: targetPaint.hex }}
              className="text-6xl sm:text-7xl font-black font-heading tracking-widest uppercase mt-6 drop-shadow-sm"
            >
              {targetWord.name}
            </motion.h1>
          </AnimatePresence>
        </motion.div>

        {/* Options Grid (Pure Color Blocks) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 w-full px-2">
          <AnimatePresence mode="popLayout">
            {options.map((option, idx) => (
              <motion.button
                key={`${option.name}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleOptionClick(option)}
                style={{ backgroundColor: option.hex }}
                className="aspect-[3/2] rounded-[1.5rem] shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-white/20 transition-all hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)]"
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
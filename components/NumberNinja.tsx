// components/NumberNinja.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, Check } from "lucide-react";

interface NumberNinjaProps {
  onGameOver: (score: number) => void;
}

export default function NumberNinja({ onGameOver }: NumberNinjaProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [hasEnded, setHasEnded] = useState(false);
  
  // Game Logic State
  const [targetNumber, setTargetNumber] = useState(0);
  const [maxRange, setMaxRange] = useState(10);
  const [currentGuess, setCurrentGuess] = useState("");
  const [feedback, setFeedback] = useState("Awaiting input...");
  const [feedbackColor, setFeedbackColor] = useState("text-[#220849]/40");
  const [attempts, setAttempts] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateLevel = useCallback((currentLevel: number) => {
    let newMax = 10;
    if (currentLevel === 2) newMax = 50;
    if (currentLevel === 3) newMax = 100;
    if (currentLevel === 4) newMax = 500;
    if (currentLevel >= 5) newMax = 1000 * (currentLevel - 4);

    const newTarget = Math.floor(Math.random() * newMax) + 1;
    
    setMaxRange(newMax);
    setTargetNumber(newTarget);
    setCurrentGuess("");
    setAttempts(0);
    setFeedback(`Target is between 1 and ${newMax}`);
    setFeedbackColor("text-[#220849]/50");
  }, []);

  // Initialize Game on Mount
  useEffect(() => {
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setHasEnded(false);
    generateLevel(1);

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
  }, [generateLevel]);

  // Handle Game Over Logically
  useEffect(() => {
    if (timeLeft === 0 && !hasEnded) {
      setHasEnded(true);
      if (typeof onGameOver === "function") {
        setTimeout(() => onGameOver(score), 500); 
      } else {
        console.error("CRITICAL: onGameOver function is missing in NumberNinja!");
      }
    }
  }, [timeLeft, score, onGameOver, hasEnded]);

  const handleNumpadClick = (val: string) => {
    if (timeLeft === 0 || hasEnded) return;

    if (val === "C") {
      setCurrentGuess("");
    } else if (val === "ENTER") {
      checkGuess();
    } else {
      if (currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + val);
      }
    }
  };

  const checkGuess = () => {
    if (!currentGuess || hasEnded) return;
    
    const guess = parseInt(currentGuess);
    setAttempts((prev) => prev + 1);

    if (guess === targetNumber) {
      // Correct!
      const pointsEarned = (level * 200) - (attempts * 10);
      setScore((prev) => prev + Math.max(50, pointsEarned));
      setTimeLeft((prev) => prev + 5); 
      
      setFeedback("ACCESS GRANTED");
      setFeedbackColor("text-green-500 font-black tracking-widest");
      
      setTimeout(() => {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        generateLevel(nextLevel);
      }, 1000);

    } else if (guess < targetNumber) {
      setFeedback("TOO LOW 🔼");
      setFeedbackColor("text-orange-500 font-bold");
      setCurrentGuess("");
    } else {
      setFeedback("TOO HIGH 🔽");
      setFeedbackColor("text-rose-500 font-bold");
      setCurrentGuess("");
    }
  };

  const numpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "ENTER"];

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center p-2 sm:p-4">
      
      {/* 📊 HUD (Mobile Optimized Glassmorphism) */}
      <div className="w-full flex justify-between items-center z-10 mb-6">
        <div className="bg-white/70 backdrop-blur-xl px-4 py-2.5 sm:px-5 sm:py-3 rounded-[1.25rem] shadow-sm border border-white flex items-center gap-3 sm:gap-4">
          <span className="text-[#220849]/50 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
            Time <span className={`ml-1 text-xs sm:text-sm ${timeLeft <= 10 ? "text-rose-500 animate-pulse" : "text-[#220849]"}`}>{timeLeft}s</span>
          </span>
          <div className="w-px h-4 bg-[#220849]/10"></div>
          <span className="text-[#220849]/50 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
            Lvl <span className="ml-1 text-xs sm:text-sm text-[#220849]">{level}</span>
          </span>
        </div>
        <div className="bg-white/70 backdrop-blur-xl px-4 py-2.5 sm:px-5 sm:py-3 rounded-[1.25rem] shadow-sm border border-white">
          <span className="text-[#220849]/50 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
            Score <span className="ml-1 text-xs sm:text-sm text-[#5f2396]">{score}</span>
          </span>
        </div>
      </div>

      {/* 🎮 Game Area */}
      <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-between pb-2">
        
        {/* Visor Screen (Feedback & Input) */}
        <div className="w-full flex flex-col items-center justify-center flex-1">
          <AnimatePresence mode="wait">
            <motion.p 
              key={feedback} 
              initial={{ y: 5, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: -5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-4 sm:mb-6 text-center px-4 ${feedbackColor}`}
            >
              {feedback}
            </motion.p>
          </AnimatePresence>
          
          <div className="h-20 sm:h-24 flex items-center justify-center w-full">
            <span className={`text-7xl sm:text-8xl font-light tracking-tight transition-colors duration-300 ${currentGuess ? 'text-[#220849]' : 'text-[#220849]/10'}`}>
              {currentGuess || "0"}
            </span>
          </div>
        </div>

        {/* Luxury Numpad (Ergonomically placed at bottom for mobile thumbs) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full px-1">
          {numpadKeys.map((key) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9, backgroundColor: key === "ENTER" ? "#40126b" : "#f3f4f6" }}
              onClick={() => handleNumpadClick(key)}
              className={`aspect-[4/3] rounded-2xl sm:rounded-[1.25rem] font-medium text-2xl sm:text-3xl transition-all flex items-center justify-center ${
                key === "ENTER" 
                  ? "bg-gradient-to-br from-[#5f2396] to-[#40126b] text-white shadow-[0_4px_15px_rgba(95,35,150,0.3)] border border-[#a855f7]/30" 
                  : key === "C" 
                  ? "bg-white/40 text-[#220849]/40 hover:text-rose-500 shadow-sm border border-white/60 backdrop-blur-md" 
                  : "bg-white/80 backdrop-blur-md text-[#220849] shadow-sm border border-white hover:bg-white"
              }`}
            >
              {key === "ENTER" ? <Check size={28} strokeWidth={2.5} /> : key === "C" ? <Delete size={26} strokeWidth={2} /> : key}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
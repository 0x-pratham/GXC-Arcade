// components/OddOneOut.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OddOneOutProps {
  onGameOver: (score: number) => void;
}

// Pairs of similar-looking emojis to confuse the player
const EMOJI_PAIRS = [
  ["😀", "😃"], ["🍎", "🍅"], ["🚗", "🚕"], ["🌟", "⭐"], 
  ["👀", "👁️"], ["🍔", "🥪"], ["🌙", "🌜"], ["⚽", "🏀"],
  ["🟩", "🟢"], ["📝", "📄"], ["🐶", "🐺"], ["🔥", "☄️"]
];

export default function OddOneOut({ onGameOver }: OddOneOutProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [level, setLevel] = useState(1);
  const [hasEnded, setHasEnded] = useState(false);
  
  // Grid Data
  const [items, setItems] = useState<string[]>([]);
  const [oddIndex, setOddIndex] = useState<number>(-1);
  const [gridSize, setGridSize] = useState(2); // 2x2 init
  const [wobbleError, setWobbleError] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateLevel = useCallback((currentLevel: number) => {
    // Determine grid size based on level (Max 6x6)
    let size = 2;
    if (currentLevel > 1) size = 3;
    if (currentLevel > 3) size = 4;
    if (currentLevel > 6) size = 5;
    if (currentLevel > 10) size = 6;
    
    setGridSize(size);
    const totalItems = size * size;

    // Pick a random emoji pair
    const pairIndex = Math.floor(Math.random() * EMOJI_PAIRS.length);
    const [normalItem, oddItem] = EMOJI_PAIRS[pairIndex];

    // Pick the random spot for the odd one
    const oddSpot = Math.floor(Math.random() * totalItems);
    setOddIndex(oddSpot);

    // Fill the grid
    const newItems = Array(totalItems).fill(normalItem);
    newItems[oddSpot] = oddItem;
    setItems(newItems);
  }, []);

  // Initialize Game on Mount
  useEffect(() => {
    setScore(0);
    setLevel(1);
    setTimeLeft(30);
    setHasEnded(false);
    generateLevel(1);

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
  }, [generateLevel]);

  // Handle Game Over Logically
  useEffect(() => {
    if (timeLeft === 0 && !hasEnded) {
      setHasEnded(true);
      if (typeof onGameOver === "function") {
        onGameOver(score);
      } else {
        console.error("CRITICAL: onGameOver function is missing in OddOneOut!");
      }
    }
  }, [timeLeft, score, onGameOver, hasEnded]);

  const handleItemClick = (index: number) => {
    if (timeLeft === 0 || hasEnded) return;

    if (index === oddIndex) {
      // Correct!
      const points = level * 100;
      setScore((prev) => prev + points);
      
      const nextLevel = level + 1;
      setLevel(nextLevel);
      generateLevel(nextLevel);
    } else {
      // Wrong! Penalty
      setWobbleError(true);
      setTimeout(() => setWobbleError(false), 400); // Reset wobble
      
      setTimeLeft((prev) => Math.max(0, prev - 2)); // -2 seconds
      setScore((prev) => Math.max(0, prev - 50));   // -50 points
    }
  };

  return (
    <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-between p-2">
      
      {/* Header HUD */}
      <div className="w-full flex justify-between items-center z-10 mb-6">
        <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-xl border border-[#c7a6f3]/50 shadow-sm flex gap-4">
          <span className="text-[#220849] font-bold text-sm tracking-widest uppercase">
            Time <span className={`ml-2 ${timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-[#5f2396]"}`}>{timeLeft}s</span>
          </span>
          <span className="text-[#220849] font-bold text-sm tracking-widest uppercase hidden sm:inline border-l border-[#c7a6f3]/30 pl-4">
            Level <span className="ml-2 text-[#5f2396]">{level}</span>
          </span>
        </div>
        <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-xl border border-[#c7a6f3]/50 shadow-sm">
          <span className="text-[#220849] font-bold text-sm tracking-widest uppercase">
            Score <span className="ml-2 text-[#5f2396]">{score}</span>
          </span>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        <motion.div 
          key={level} // Re-animate on level change
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, x: wobbleError ? [-10, 10, -10, 10, 0] : 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md mx-auto aspect-square bg-[#f4effc] border border-[#c7a6f3]/50 rounded-[2rem] p-3 md:p-5 grid gap-2 md:gap-3 shadow-[0_10px_30px_rgba(199,166,243,0.15)]"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
          }}
        >
          {items.map((emoji, index) => (
            <motion.button
              key={`${level}-${index}`}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleItemClick(index)}
              className="bg-white rounded-xl shadow-sm border border-[#c7a6f3]/30 flex items-center justify-center text-4xl md:text-5xl hover:border-[#5f2396] hover:shadow-md transition-all"
            >
              <span className="select-none">{emoji}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
// components/OddOneOut.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Hexagon, Octagon, 
  Square, Squircle, 
  Sun, SunDim, 
  Cloud, CloudRain, 
  MessageCircle, MessageSquare, 
  Shield, ShieldAlert,
  AlignJustify, AlignLeft,
  Battery, BatteryMedium
} from "lucide-react";

interface OddOneOutProps {
  onGameOver: (score: number) => void;
}

// Complex geometric and visual pairs for a premium brain-training feel
const ICON_PAIRS = [
  [Hexagon, Octagon], 
  [Square, Squircle], 
  [Sun, SunDim], 
  [Cloud, CloudRain], 
  [MessageCircle, MessageSquare], 
  [Shield, ShieldAlert], 
  [AlignJustify, AlignLeft], 
  [Battery, BatteryMedium]
];

export default function OddOneOut({ onGameOver }: OddOneOutProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [level, setLevel] = useState(1);
  const [hasEnded, setHasEnded] = useState(false);
  
  // Grid Data
  const [items, setItems] = useState<any[]>([]);
  const [oddIndex, setOddIndex] = useState<number>(-1);
  const [gridSize, setGridSize] = useState(2); // 2x2 init
  const [wobbleError, setWobbleError] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateLevel = useCallback((currentLevel: number) => {
    // Determine grid size based on level (Max 6x6 for mobile usability)
    let size = 2;
    if (currentLevel > 1) size = 3;
    if (currentLevel > 3) size = 4;
    if (currentLevel > 6) size = 5;
    if (currentLevel > 10) size = 6;
    
    setGridSize(size);
    const totalItems = size * size;

    // Pick a random icon pair
    const pairIndex = Math.floor(Math.random() * ICON_PAIRS.length);
    // Randomize which one is the "normal" vs "odd"
    const isReversed = Math.random() > 0.5;
    const normalItem = isReversed ? ICON_PAIRS[pairIndex][1] : ICON_PAIRS[pairIndex][0];
    const oddItem = isReversed ? ICON_PAIRS[pairIndex][0] : ICON_PAIRS[pairIndex][1];

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
        setTimeout(() => onGameOver(score), 400); // Slight delay for UX
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
      setTimeout(() => setWobbleError(false), 400); 
      
      setTimeLeft((prev) => Math.max(0, prev - 2)); // -2 seconds
      setScore((prev) => Math.max(0, prev - 50));   // -50 points
    }
  };

  // Dynamic icon sizing based on grid density
  const getIconSize = () => {
    if (gridSize <= 3) return 40;
    if (gridSize === 4) return 32;
    if (gridSize === 5) return 24;
    return 20; // 6x6
  };

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
            Lvl <span className="ml-1 text-xs sm:text-sm text-[#220849]">{level}</span>
          </span>
        </div>
        <div className="bg-white/70 backdrop-blur-xl px-4 py-2.5 sm:px-5 sm:py-3 rounded-[1.25rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white">
          <span className="text-[#220849]/50 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
            Score <span className="ml-1 text-xs sm:text-sm text-[#5f2396]">{score}</span>
          </span>
        </div>
      </div>

      {/* 🎮 Game Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        <motion.div 
          key={level} // Re-animate on level change
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, x: wobbleError ? [-8, 8, -8, 8, 0] : 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md mx-auto aspect-square bg-white/40 backdrop-blur-md border border-white/60 rounded-[2rem] p-3 sm:p-5 grid shadow-[0_10px_30px_rgba(199,166,243,0.15)]"
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
            gap: gridSize >= 5 ? '6px' : '10px'
          }}
        >
          {items.map((IconComponent, index) => (
            <motion.button
              key={`${level}-${index}`}
              whileTap={{ scale: 0.85, backgroundColor: "#f4effc" }}
              onClick={() => handleItemClick(index)}
              className={`bg-white rounded-[1rem] shadow-sm border border-[#c7a6f3]/20 flex items-center justify-center text-[#220849] hover:border-[#5f2396]/50 hover:shadow-md transition-all ${wobbleError ? 'bg-red-50/50' : ''}`}
            >
              <IconComponent 
                size={getIconSize()} 
                strokeWidth={gridSize >= 5 ? 2.5 : 2} 
                className="text-[#220849] opacity-80"
              />
            </motion.button>
          ))}
        </motion.div>

        {/* Start Hint Overlay (Fades out quickly) */}
        {level === 1 && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 pointer-events-none"
          >
            <span className="bg-[#220849]/10 px-4 py-2 rounded-full font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#220849]/60">
              Tap the anomaly
            </span>
          </motion.div>
        )}
      </div>

    </div>
  );
}
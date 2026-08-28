// components/MemoryFlip.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, Droplet, 
  Leaf, Zap, 
  Sun, Moon, 
  Star, Heart 
} from "lucide-react";

interface MemoryFlipProps {
  onGameOver: (score: number) => void;
}

// Premium icon set with specific brand/neon colors for cognitive anchoring
const CARD_TYPES = [
  { id: "flame", Icon: Flame, color: "text-orange-500", shadow: "drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]" },
  { id: "drop", Icon: Droplet, color: "text-blue-400", shadow: "drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]" },
  { id: "leaf", Icon: Leaf, color: "text-emerald-400", shadow: "drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" },
  { id: "zap", Icon: Zap, color: "text-yellow-400", shadow: "drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]" },
  { id: "sun", Icon: Sun, color: "text-amber-500", shadow: "drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" },
  { id: "moon", Icon: Moon, color: "text-indigo-400", shadow: "drop-shadow-[0_0_12px_rgba(129,140,248,0.6)]" },
  { id: "star", Icon: Star, color: "text-purple-400", shadow: "drop-shadow-[0_0_12px_rgba(192,132,252,0.6)]" },
  { id: "heart", Icon: Heart, color: "text-rose-500", shadow: "drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]" }
];

type Card = {
  uniqueId: number;
  typeId: string;
  Icon: any;
  color: string;
  shadow: string;
  isFlipped: boolean;
  isMatched: boolean;
  isMismatched?: boolean;
};

export default function MemoryFlip({ onGameOver }: MemoryFlipProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  
  // Game Stats & UX Engine
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [liveScore, setLiveScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [hasEnded, setHasEnded] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Game
  useEffect(() => {
    const deck = [...CARD_TYPES, ...CARD_TYPES]
      .sort(() => Math.random() - 0.5)
      .map((cardData, index) => ({
        uniqueId: index,
        typeId: cardData.id,
        Icon: cardData.Icon,
        color: cardData.color,
        shadow: cardData.shadow,
        isFlipped: false,
        isMatched: false,
        isMismatched: false,
      }));

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setLiveScore(0);
    setCombo(1);
    setHasEnded(false);

    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Win Condition
  useEffect(() => {
    if (matches === CARD_TYPES.length && !hasEnded) {
      setHasEnded(true);
      if (timerRef.current) clearInterval(timerRef.current);

      // Final Score = Base Game Score + Speed Bonus
      const timeBonus = Math.max(0, (60 - time) * 50); // Fast completion reward
      const finalScore = liveScore + timeBonus;
      
      if (typeof onGameOver === "function") {
        setTimeout(() => onGameOver(finalScore), 800);
      }
    }
  }, [matches, hasEnded, time, liveScore, onGameOver]);

  const handleCardClick = (index: number) => {
    if (hasEnded || cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIndex, secondIndex] = newFlipped;

      if (newCards[firstIndex].typeId === newCards[secondIndex].typeId) {
        // ✨ MATCH FOUND (Combo Engine)
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setFlippedIndices([]);
        setMatches(matches + 1);
        
        // Add Score with Combo Multiplier
        setLiveScore((prev) => prev + (500 * combo));
        setCombo((prev) => prev + 1); // Increase combo for next match
      } else {
        // ❌ NO MATCH (Reset Combo)
        setCombo(1);
        newCards[firstIndex].isMismatched = true;
        newCards[secondIndex].isMismatched = true;
        setCards([...newCards]);

        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          resetCards[firstIndex].isMismatched = false;
          resetCards[secondIndex].isMismatched = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[550px] flex flex-col items-center justify-start p-2 sm:p-4">
      
      {/* 📊 HUD (Mobile Optimized Glassmorphism with Combo Engine) */}
      <div className="w-full flex justify-between items-center z-10 mb-6 sm:mb-8">
        <div className="bg-white/70 backdrop-blur-xl px-4 py-2.5 sm:px-5 sm:py-3 rounded-[1.25rem] shadow-sm border border-white flex items-center gap-3 sm:gap-4">
          <span className="text-[#220849]/50 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
            Time <span className={`ml-1 text-xs sm:text-sm ${time >= 45 ? "text-rose-500 animate-pulse" : "text-[#220849]"}`}>{time}s</span>
          </span>
          <div className="w-px h-4 bg-[#220849]/10"></div>
          <span className="text-[#220849]/50 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
            Moves <span className="ml-1 text-xs sm:text-sm text-[#220849]">{moves}</span>
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="bg-white/70 backdrop-blur-xl px-4 py-2.5 sm:px-5 sm:py-3 rounded-[1.25rem] shadow-sm border border-white flex items-center gap-2">
            <span className="text-[#220849]/50 font-bold text-[10px] sm:text-xs tracking-widest uppercase">
              Score <span className="ml-1 text-sm sm:text-base text-[#5f2396] font-black">{liveScore.toLocaleString()}</span>
            </span>
          </div>
          {/* Dynamic Combo Indicator */}
          <AnimatePresence>
            {combo > 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-16 right-4 sm:right-6 bg-gradient-to-r from-orange-400 to-rose-500 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-black shadow-lg uppercase tracking-widest"
              >
                Combo x{combo}!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 🎮 Grid Area (16 Cards) */}
      <div className="flex-1 w-full flex items-center justify-center pb-4">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 w-full max-w-md mx-auto">
          <AnimatePresence>
            {cards.map((card, index) => (
              <motion.div
                key={card.uniqueId}
                onClick={() => handleCardClick(index)}
                className="aspect-square relative cursor-pointer group"
                whileTap={{ scale: card.isFlipped || card.isMatched ? 1 : 0.92 }}
                style={{ perspective: "1000px" }}
              >
                {/* 3D Snappy Flip Animation */}
                <motion.div
                  initial={false}
                  animate={{ 
                    rotateY: card.isFlipped || card.isMatched ? 180 : 0,
                    scale: card.isMatched ? 0.95 : 1,
                    x: card.isMismatched ? [-3, 3, -3, 3, 0] : 0 
                  }}
                  transition={{ 
                    duration: 0.5, 
                    type: "spring", 
                    mass: 0.8,
                    stiffness: 300, 
                    damping: 22,
                    x: { duration: 0.2 } 
                  }}
                  className="w-full h-full relative"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* FRONT OF CARD (Dark Luxury with Custom Logo) */}
                  <div 
                    className={`absolute inset-0 w-full h-full bg-gradient-to-br from-[#2a0e4e] to-[#140529] rounded-[1rem] sm:rounded-[1.25rem] flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.2)] border border-white/5 group-hover:border-[#c7a6f3]/40 transition-colors`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <motion.img 
                      animate={{ opacity: [0.3, 0.6, 0.3] }} // Ambient pulse
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      src="/icon.svg" 
                      alt="GXC Logo" 
                      className="w-8 h-8 sm:w-12 sm:h-12 drop-shadow-[0_0_12px_rgba(199,166,243,0.2)] group-hover:opacity-100 transition-opacity" 
                    />
                  </div>

                  {/* BACK OF CARD (Colored Neon Icon on Frosted Glass) */}
                  <div 
                    className={`absolute inset-0 w-full h-full rounded-[1rem] sm:rounded-[1.25rem] flex items-center justify-center shadow-md border-2 transition-colors duration-300 ${
                      card.isMatched 
                        ? 'bg-green-50/95 border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.4)]' 
                        : card.isMismatched
                        ? 'bg-rose-50/95 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                        : 'bg-white/90 backdrop-blur-md border-[#c7a6f3]/50 shadow-[0_8px_25px_rgba(199,166,243,0.15)]'
                    }`}
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <motion.div
                      animate={{ scale: card.isMatched ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <card.Icon 
                        size={40} 
                        strokeWidth={2.5}
                        className={`${card.color} ${card.shadow} sm:w-12 sm:h-12`}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* UX: Invisible until user hesitates */}
      {moves === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1 }}
          className="absolute bottom-6 pointer-events-none"
        >
          <span className="bg-[#220849]/10 px-4 py-2 rounded-full font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#220849]/50 border border-white/40">
            Tap to begin linking
          </span>
        </motion.div>
      )}
    </div>
  );
}
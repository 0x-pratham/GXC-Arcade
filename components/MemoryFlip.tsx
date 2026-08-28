// components/MemoryFlip.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface MemoryFlipProps {
  onGameOver: (score: number) => void;
}

const EMOJIS = ["🚀", "👽", "💎", "🍕", "🎸", "⚡", "🕹️", "🍎"];

type Card = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function MemoryFlip({ onGameOver }: MemoryFlipProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [time, setTime] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and shuffle cards automatically on mount
  useEffect(() => {
    const shuffledCards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(shuffledCards);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setTime(0);
    setHasEnded(false);

    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle Win Condition Logic
  useEffect(() => {
    if (matches === EMOJIS.length && !hasEnded) {
      setHasEnded(true);
      if (timerRef.current) clearInterval(timerRef.current);

      // Score Calculation
      const timePenalty = time * 20;
      const movePenalty = moves * 50;
      const finalScore = Math.max(0, 10000 - timePenalty - movePenalty);
      
      if (typeof onGameOver === "function") {
        // Small delay to let the user see the final flipped card before screen switches
        setTimeout(() => {
          onGameOver(finalScore);
        }, 800);
      } else {
        console.error("CRITICAL: onGameOver function is missing in MemoryFlip!");
      }
    }
  }, [matches, hasEnded, time, moves, onGameOver]);

  // Handle Card Click
  const handleCardClick = (index: number) => {
    if (hasEnded) return;
    
    // Prevent clicking already flipped, matched cards, or if 2 cards are already flipping
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) {
      return;
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // Update card state to flipped
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    // Check for match if 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIndex, secondIndex] = newFlipped;

      if (newCards[firstIndex].emoji === newCards[secondIndex].emoji) {
        // Match found!
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setFlippedIndices([]);
        setMatches(matches + 1);
      } else {
        // No match, flip back after 1 second
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-between p-2">
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-center z-10 mb-8">
        <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-xl border border-[#c7a6f3]/50 shadow-sm">
          <span className="text-[#220849] font-bold text-sm tracking-widest uppercase">
            Moves <span className="ml-2 text-[#5f2396]">{moves}</span>
          </span>
        </div>
        <div className="bg-white/80 backdrop-blur px-5 py-2.5 rounded-xl border border-[#c7a6f3]/50 shadow-sm">
          <span className="text-[#220849] font-bold text-sm tracking-widest uppercase">
            Time <span className="ml-2 text-[#5f2396]">{time}s</span>
          </span>
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="grid grid-cols-4 gap-3 md:gap-4 w-full max-w-md mx-auto">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className="aspect-square relative cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              {/* Flip Animation Container */}
              <motion.div
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front of card (Hidden when flipped) */}
                <div 
                  className={`absolute inset-0 w-full h-full bg-[#110320] rounded-2xl flex items-center justify-center shadow-md border-2 border-[#5f2396]/50`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-[#c7a6f3]/40 font-black text-xl font-mono">GXC</span>
                </div>

                {/* Back of card (Shows Emoji) */}
                <div 
                  className={`absolute inset-0 w-full h-full ${card.isMatched ? 'bg-green-50 border-green-400' : 'bg-white border-[#c7a6f3]'} rounded-2xl flex items-center justify-center shadow-md border-2`}
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className="text-4xl select-none drop-shadow-sm">{card.emoji}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
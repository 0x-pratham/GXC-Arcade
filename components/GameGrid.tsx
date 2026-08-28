// components/GameGrid.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Gamepad2 } from "lucide-react";

interface GameGridProps {
  games: any[];
  loading: boolean;
}

export default function GameGrid({ games, loading }: GameGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 12 } }
  };

  return (
    <section id="arcade-section" className="w-full bg-white flex-1 pt-24 pb-32 rounded-t-[3rem] md:rounded-t-[4rem] shadow-[0_-10px_40px_rgba(199,166,243,0.15)] border-t border-[#c7a6f3]/30 relative z-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Gamepad2 size={32} className="text-[#5f2396]" />
            <h2 className="text-4xl md:text-5xl font-black font-heading text-[#220849] tracking-tight">
              Active Games
            </h2>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-[#5f2396] to-[#c7a6f3] rounded-full"></div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#f4effc] border-t-[#5f2396] rounded-full animate-spin"></div>
            <p className="text-[#5f2396] font-mono font-bold text-sm tracking-widest uppercase animate-pulse">
              Loading Data...
            </p>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-20 bg-[#f4effc] rounded-[2rem] border border-[#c7a6f3]/50 max-w-2xl mx-auto shadow-inner">
            <p className="text-2xl font-bold text-[#220849] mb-2">No Games Found</p>
            <p className="text-[#220849]/60 font-medium">There are currently no active games available.</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {games.map((game) => (
              <motion.div
                key={game.id}
                variants={cardVariants}
                className="group relative bg-white rounded-[2rem] border border-[#c7a6f3]/40 hover:border-[#5f2396]/40 shadow-sm hover:shadow-[0_20px_40px_rgba(95,35,150,0.08)] transition-all duration-500 flex flex-col overflow-hidden"
              >
                {/* Image Container */}
                <div className="p-3 pb-0">
                  <div className="relative h-56 w-full rounded-[1.25rem] overflow-hidden bg-[#f4effc] border border-[#c7a6f3]/20">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#220849]/60 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-20 transition-opacity duration-500"></div>
                    
                    {game.thumbnail_url ? (
                      <img
                        src={game.thumbnail_url}
                        alt={game.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[#c7a6f3] font-bold text-3xl font-heading opacity-30 z-20">GXC</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Content Area */}
                <div className="p-6 md:p-8 pt-6 flex flex-col flex-1">
                  
                  <h3 className="text-2xl font-black font-heading text-[#220849] mb-3 group-hover:text-[#5f2396] transition-colors mt-2">
                    {game.title}
                  </h3>
                  
                  <p className="text-[#220849]/60 text-sm font-medium leading-relaxed line-clamp-2 mb-8 flex-1">
                    {game.description || "A premium arcade experience. Ready to play."}
                  </p>
                  
                  {/* Action Button */}
                  <Link href={`/games/${game.id}`} className="mt-auto block">
                    <div className="flex items-center justify-between w-full bg-[#f4effc] group-hover:bg-[#220849] border border-[#c7a6f3]/50 group-hover:border-[#220849] px-6 py-4 rounded-xl transition-colors duration-300">
                      <span className="font-bold text-[#220849] group-hover:text-white transition-colors text-sm uppercase tracking-wide">
                        Play Game
                      </span>
                      <div className="bg-white group-hover:bg-[#5f2396] text-[#5f2396] group-hover:text-white p-2 rounded-lg transition-colors duration-300">
                        <Play size={16} className="ml-0.5 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                  </Link>

                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
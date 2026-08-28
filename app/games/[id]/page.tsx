// app/games/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import GameWrapper from "../../../components/GameWrapper";

// Game Components
import ReactionRush from "../../../components/ReactionRush";
import ColorClash from "../../../components/ColorClash";
import MemoryFlip from "../../../components/MemoryFlip";
import TargetTap from "../../../components/TargetTap";
import OddOneOut from "../../../components/OddOneOut";
import NumberNinja from "../../../components/NumberNinja";

interface Game {
  id: string;
  title: string;
  description?: string;
  [key: string]: any;
}

export default function GamePlayerPage() {
  const params = useParams();
  const gameId = params?.id;

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      if (typeof gameId !== "string") {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("games")
          .select("*")
          .eq("id", gameId)
          .single();

        if (error) {
          console.error("Failed to fetch game:", error);
          setGame(null);
          return;
        }

        setGame(data);
      } catch (error) {
        console.error("Unexpected error while fetching game:", error);
        setGame(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4effc] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#e2d4f8] border-t-[#5f2396] rounded-full animate-spin" />
      </div>
    );
  }

  // Game Not Found
  if (!game) {
    return (
      <div className="min-h-screen bg-[#f4effc] flex justify-center items-center p-6">
        <div className="bg-white rounded-2xl shadow-md border border-[#c7a6f3]/50 p-10 text-center">
          <h2 className="text-2xl font-bold text-[#220849] font-heading">
            Module Not Found
          </h2>

          <p className="text-[#220849]/60 mt-2">
            The requested game could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GameWrapper
      gameId={game.id}
      gameTitle={game.title}
    >
      {(onGameOver: (score: number) => void) => {
        /*
         * Dynamic Game Router
         *
         * GameWrapper provides the onGameOver callback.
         * We explicitly pass that callback to the selected
         * game component.
         */

        switch (game.title) {
          case "Reaction Rush":
            return (
              <ReactionRush
                onGameOver={onGameOver}
              />
            );

          case "Color Clash":
            return (
              <ColorClash
                onGameOver={onGameOver}
              />
            );

          case "Memory Flip":
            return (
              <MemoryFlip
                onGameOver={onGameOver}
              />
            );

          case "Target Tap":
            return (
              <TargetTap
                onGameOver={onGameOver}
              />
            );

          case "Odd One Out":
            return (
              <OddOneOut
                onGameOver={onGameOver}
              />
            );

          case "Number Ninja":
            return (
              <NumberNinja
                onGameOver={onGameOver}
              />
            );

          default:
            return (
              <div className="w-full h-full min-h-[450px] flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-[#220849]">
                    Game Component Not Found
                  </h2>

                  <p className="text-[#220849]/60 mt-2">
                    No component is linked with "{game.title}".
                  </p>
                </div>
              </div>
            );
        }
      }}
    </GameWrapper>
  );
}
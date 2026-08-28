// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getActiveGames } from "../lib/actions";
import Hero from "../components/Hero";
import Features from "../components/Features";
import GameGrid from "../components/GameGrid";
import Footer from "../components/Footer";

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      const fetchedGames = await getActiveGames();
      setGames(fetchedGames);
      setLoading(false);
    }
    loadGames();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#f4effc] text-[#220849] font-body selection:bg-[#c7a6f3] selection:text-[#220849]">
      <Hero />
      <Features />
      <GameGrid games={games} loading={loading} />
      <Footer />
    </main>
  );
}
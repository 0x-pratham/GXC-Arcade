"use client";

import AwsQuiz from "@/components/AwsQuiz";
import GameAuthGuard from "@/components/GameAuthGuard";

export default function AwsQuizPage() {
  return (
    <GameAuthGuard gameName="AWS Cloud Quest">
      <main className="min-h-screen bg-[#f4effc] px-4 py-10">
        <AwsQuiz />
      </main>
    </GameAuthGuard>
  );
}

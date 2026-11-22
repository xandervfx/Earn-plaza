import React, { useState } from "react";
import MiningCard from "./MiningCard";
import MiningStats from "./MiningStats";
import { Pickaxe } from "lucide-react";

export default function MiningPage() {
  const [isMining, setIsMining] = useState(false);

  // Temporary demonstration data
  const miningData = {
    points: 0,
    sessions: 0,
    totalTime: "0h",
    timeLeft: "Not started"
  };

  const handleStartMining = () => {
    setIsMining(true);
  };

  return (
    <div className="min-h-screen bg-[#050B18] px-4 py-6 text-white">
      <div className="mx-auto max-w-4xl space-y-6">

        <header>
          <div className="mb-2 flex items-center gap-2 text-emerald-400">
            <Pickaxe size={22} />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Earn Plaza Mining
            </span>
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">
            EPT Mining
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your mining sessions and track your EPT points.
          </p>
        </header>

        <MiningCard
          isMining={isMining}
          points={miningData.points}
          timeLeft={miningData.timeLeft}
          onStart={handleStartMining}
        />

        <MiningStats
          totalPoints={miningData.points}
          sessions={miningData.sessions}
          totalTime={miningData.totalTime}
        />

        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
          <h3 className="font-semibold text-white">
            How Mining Works
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Start a mining session to participate in the Earn Plaza
            points system. Your mining activity and rewards will be
            displayed here once the system is connected.
          </p>
        </div>

      </div>
    </div>
  );
}
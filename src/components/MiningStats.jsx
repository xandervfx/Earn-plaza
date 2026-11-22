import React from "react";
import { Coins, Clock, Pickaxe } from "lucide-react";

const StatItem = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
    <div className="mb-3 flex items-center gap-2 text-slate-400">
      <Icon size={18} className="text-emerald-400" />
      <span className="text-sm">{label}</span>
    </div>

    <p className="text-xl font-bold text-white">{value}</p>
  </div>
);

export default function MiningStats({
  totalPoints = 0,
  sessions = 0,
  totalTime = "0h"
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-bold text-white">
        Mining Overview
      </h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatItem
          icon={Coins}
          label="Total EPT"
          value={Number(totalPoints).toLocaleString()}
        />

        <StatItem
          icon={Pickaxe}
          label="Sessions"
          value={sessions}
        />

        <StatItem
          icon={Clock}
          label="Mining Time"
          value={totalTime}
        />
      </div>
    </section>
  );
}
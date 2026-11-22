import React from "react";
import { Pickaxe, Clock, Zap } from "lucide-react";

export default function MiningCard({
  isMining = false,
  points = 0,
  timeLeft = "Not started",
  onStart
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-emerald-500/10 p-3">
          <Pickaxe className="h-6 w-6 text-emerald-400" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-white">EPT Mining</h2>
          <p className="text-sm text-slate-400">
            Earn Plaza Token
          </p>
        </div>
      </div>

      <div className="my-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-xs text-slate-400">Total Points</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            {Number(points).toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl bg-slate-800 p-4">
          <p className="text-xs text-slate-400">Time Remaining</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
            <Clock size={16} />
            {timeLeft}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={isMining}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Zap size={18} />
        {isMining ? "Mining in Progress" : "Start Mining"}
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">
        {isMining
          ? "Your mining session is active."
          : "Start a session to begin earning EPT points."}
      </p>
    </div>
  );
}
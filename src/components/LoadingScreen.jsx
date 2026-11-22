
import React from "react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-[#050B18]">
      <img
        src="/earnplaza logo.003.gif"
        alt="Earn Plaza"
        className="h-32 w-32 object-contain animate-pulse"
      />

      <h2 className="mt-5 text-2xl font-bold text-white">
        Earn<span className="text-emerald-400">Plaza</span>
      </h2>

      <p className="mt-3 text-sm text-slate-400">
        Preparing your experience...
      </p>

      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-400" />
      </div>
    </div>
  );
}

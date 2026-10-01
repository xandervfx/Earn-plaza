// src/components/Header.jsx
import React from 'react';

export default function Header({ 
  user, 
  balance, 
  onOpenWithdraw, 
  onOpenDeposit, 
  onOpenAuth, 
  onOpenAdvertiser, 
  onLogout 
}) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
      {/* Logo / Brand */}
      <div className="font-black text-xl tracking-wide text-white cursor-pointer" onClick={() => window.location.hash = ''}>
        Earn<span className="text-emerald-400">Plaza</span>
      </div>

      {/* Navigation / User Controls */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Wallet Balance Display */}
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Balance:</span>
              <span className="text-sm font-bold text-emerald-400">${Number(balance).toFixed(2)}</span>
            </div>

            {/* + Deposit Button */}
            <button
              onClick={onOpenDeposit}
              className="text-xs font-bold px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              + Deposit
            </button>

            {/* Withdraw Button */}
            <button
              onClick={onOpenWithdraw}
              className="text-xs font-bold px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition border border-slate-700 cursor-pointer"
            >
              Withdraw
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="text-xs text-slate-400 hover:text-rose-400 transition ml-2 font-semibold cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={onOpenAuth}
            className="text-xs font-bold px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition cursor-pointer"
          >
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}
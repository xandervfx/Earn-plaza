```jsx
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
    <header className="w-full max-w-full min-w-0 overflow-x-clip bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-4">
      <div className="w-full min-w-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

        {/* Logo / Brand */}
        <div
          className="font-black text-xl tracking-wide text-white cursor-pointer shrink-0 self-start"
          onClick={() => {
            window.location.hash = '';
          }}
        >
          Earn<span className="text-emerald-400">Plaza</span>
        </div>

        {/* Navigation / User Controls */}
        <div className="w-full min-w-0 flex flex-wrap items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Wallet Balance */}
              <div className="min-w-0 flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">
                  Balance:
                </span>
                <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                  ${Number(balance || 0).toFixed(2)}
                </span>
              </div>

              {/* Deposit */}
              <button
                type="button"
                onClick={onOpenDeposit}
                className="shrink-0 text-xs font-bold px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                + Deposit
              </button>

              {/* Withdraw */}
              <button
                type="button"
                onClick={onOpenWithdraw}
                className="shrink-0 text-xs font-bold px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition border border-slate-700 cursor-pointer"
              >
                Withdraw
              </button>

              {/* Logout */}
              <button
                type="button"
                onClick={onLogout}
                className="shrink-0 text-xs text-slate-400 hover:text-rose-400 transition font-semibold cursor-pointer px-2 py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="shrink-0 text-xs font-bold px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition cursor-pointer"
            >
              Sign In / Register
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
```
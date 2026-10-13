import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  UserRound,
  Bell,
  Settings,
  CircleHelp,
  Users,
  LogOut,
  Megaphone
} from 'lucide-react';

export default function Header({
  user,
  balance,
  onOpenWithdraw,
  onOpenDeposit,
  onOpenAuth,
  onOpenAdvertiser,
  onLogout,
  onOpenProfile,
  onOpenNotifications,
  onOpenSupport,
  onOpenSettings,
  onOpenReferrals,
  onOpenWallet,
  notificationCount = 0
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const runAction = (action) => {
    setMenuOpen(false);
    if (typeof action === 'function') {
      action();
    }
  };

  const menuItemClass =
    'w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition text-left';

  return (
    <header className="relative z-40 w-full max-w-full min-w-0 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-4">
      <div className="w-full min-w-0 flex items-center justify-between gap-3">
        {/* Existing Earn Plaza logo */}
        <button
          type="button"
          className="font-black text-xl tracking-wide text-white cursor-pointer shrink-0"
          onClick={() => {
            setMenuOpen(false);
            window.location.hash = '';
          }}
          aria-label="Go to Earn Plaza home"
        >
          Earn<span className="text-emerald-400">Plaza</span>
        </button>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Balance remains visible */}
            <button
              type="button"
              onClick={() => runAction(onOpenWallet || onOpenDeposit)}
              className="min-w-0 flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition"
              aria-label="Open wallet"
            >
              <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline text-xs text-slate-400 font-semibold">
                Balance:
              </span>
              <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                ${Number(balance || 0).toFixed(2)}
              </span>
            </button>

            {/* Notification bell appears when a notification handler exists */}
            {typeof onOpenNotifications === 'function' && (
              <button
                type="button"
                onClick={() => runAction(onOpenNotifications)}
                className="relative shrink-0 p-2.5 rounded-xl text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition"
                aria-label="Open notifications"
              >
                <Bell className="w-5 h-5" />
                {Number(notificationCount) > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {Number(notificationCount) > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* Three-line account menu */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:border-emerald-500/50 transition"
                aria-label={menuOpen ? 'Close account menu' : 'Open account menu'}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                {menuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 max-w-[calc(100vw-24px)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Account heading */}
                  <div className="px-4 py-4 border-b border-slate-800">
                    <p className="text-sm font-bold text-white">
                      My Account
                    </p>
                    <p className="text-xs text-slate-400 mt-1 break-all">
                      {user.email || user.username || 'Earn Plaza member'}
                    </p>
                  </div>

                  <div className="py-2">
                    {typeof onOpenProfile === 'function' && (
                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => runAction(onOpenProfile)}
                      >
                        <UserRound className="w-4 h-4" />
                        My Profile
                      </button>
                    )}

                    {typeof onOpenWallet === 'function' && (
                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => runAction(onOpenWallet)}
                      >
                        <Wallet className="w-4 h-4" />
                        Wallet & Transactions
                      </button>
                    )}

                    <button
                      type="button"
                      className={menuItemClass}
                      onClick={() => runAction(onOpenDeposit)}
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      Deposit
                    </button>

                    <button
                      type="button"
                      className={menuItemClass}
                      onClick={() => runAction(onOpenWithdraw)}
                    >
                      <ArrowUpFromLine className="w-4 h-4" />
                      Withdraw
                    </button>

                    {typeof onOpenNotifications === 'function' && (
                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => runAction(onOpenNotifications)}
                      >
                        <Bell className="w-4 h-4" />
                        Notifications
                        {Number(notificationCount) > 0 && (
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                            {notificationCount}
                          </span>
                        )}
                      </button>
                    )}

                    {typeof onOpenReferrals === 'function' && (
                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => runAction(onOpenReferrals)}
                      >
                        <Users className="w-4 h-4" />
                        Referrals
                      </button>
                    )}

                    {typeof onOpenAdvertiser === 'function' && (
                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => runAction(onOpenAdvertiser)}
                      >
                        <Megaphone className="w-4 h-4" />
                        Advertiser
                      </button>
                    )}

                    {typeof onOpenSettings === 'function' && (
                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => runAction(onOpenSettings)}
                      >
                        <Settings className="w-4 h-4" />
                        Account Settings
                      </button>
                    )}

                    {typeof onOpenSupport === 'function' && (
                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => runAction(onOpenSupport)}
                      >
                        <CircleHelp className="w-4 h-4" />
                        Help & Support
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-800 p-2">
                    <button
                      type="button"
                      onClick={() => runAction(onLogout)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
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
    </header>
  );
}
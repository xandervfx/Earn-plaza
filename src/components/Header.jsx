import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Sun,
  Moon,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  UserRound,
  Bell,
  Settings,
  CircleHelp,
  Users,
  LogOut,
  Megaphone,
  FileText,
  Home,
  ChevronRight
} from 'lucide-react';

export default function Header({
  user,
  balance,
  theme = 'dark',
  onToggleTheme,
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
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const navigateTo = (page) => {
    setMenuOpen(false);

    const nextHash = page ? `#${page}` : '';

    if (window.location.hash === nextHash) {
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } else {
      window.location.hash = nextHash;
    }
  };

  const runAction = (action) => {
    setMenuOpen(false);

    if (typeof action === 'function') {
      action();
    }
  };

  const openSupport = () => {
    setMenuOpen(false);

    if (typeof onOpenSupport === 'function') {
      onOpenSupport();
    } else {
      navigateTo('support');
    }
  };

  const menuItemClass =
    'group w-full flex items-center gap-3 px-4 py-3.5 text-sm text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200 text-left';

  const iconClass =
    'w-5 h-5 shrink-0 text-slate-500 group-hover:text-emerald-400 transition-colors';

  return (
    <header className="sticky top-0 z-[60] w-full max-w-full min-w-0 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 px-3 sm:px-6 py-3 shadow-lg">
      <div className="w-full min-w-0 flex items-center justify-between gap-3">

        {/* Hamburger menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center justify-center w-11 h-11 rounded-xl border border-slate-800 bg-slate-900 text-white hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-200"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
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
            <>
              <button
                type="button"
                aria-label="Close navigation menu"
                className="fixed inset-0 z-40 bg-black/50 cursor-default"
                onClick={() => setMenuOpen(false)}
              />

              <nav
                aria-label="Main navigation"
                className="absolute left-0 top-full z-50 mt-3 w-72 max-w-[calc(100vw-24px)] rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden"
              >
                <div className="p-5 bg-gradient-to-br from-emerald-500/15 to-transparent border-b border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigateTo('')}
                      className="text-xl font-black tracking-wide text-white hover:opacity-80 transition"
                    >
                      Earn<span className="text-emerald-400">Plaza</span>
                    </button>

                    <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                      Navigation
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {user
                      ? `Welcome, ${user.name || user.username || 'Member'}`
                      : 'Explore Earn Plaza'}
                  </p>
                </div>

                <div className="py-2">
                  <p className="px-4 pt-3 pb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                    Main Menu
                  </p>

                  <button
                    type="button"
                    className={menuItemClass}
                    onClick={() => navigateTo('')}
                  >
                    <Home className={iconClass} />
                    Dashboard
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition" />
                  </button>

                  {user && (
                    <>
                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => navigateTo('profile')}
                      >
                        <UserRound className={iconClass} />
                        My Profile
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition" />
                      </button>

                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => navigateTo('deposit')}
                      >
                        <ArrowDownToLine className={iconClass} />
                        Deposit
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition" />
                      </button>

                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => navigateTo('withdraw')}
                      >
                        <ArrowUpFromLine className={iconClass} />
                        Withdraw
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition" />
                      </button>

                      <button
                        type="button"
                        className={menuItemClass}
                        onClick={() => runAction(onOpenWallet)}
                      >
                        <Wallet className={iconClass} />
                        Wallet &amp; Transactions
                        <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition" />
                      </button>

                      {typeof onOpenNotifications === 'function' && (
                        <button
                          type="button"
                          className={menuItemClass}
                          onClick={() => runAction(onOpenNotifications)}
                        >
                          <Bell className={iconClass} />
                          Notifications
                          {Number(notificationCount) > 0 && (
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                              {Number(notificationCount) > 99
                                ? '99+'
                                : notificationCount}
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
                          <Users className={iconClass} />
                          Referrals
                        </button>
                      )}
                    </>
                  )}

                  <p className="px-4 pt-5 pb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
                    More
                  </p>

                  {/* Light / Dark theme toggle */}
                  <button
                    type="button"
                    className={menuItemClass}
                    onClick={() => {
                      setMenuOpen(false);
                      if (typeof onToggleTheme === 'function') {
                        onToggleTheme();
                      }
                    }}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  >
                    {theme === 'dark' ? (
                      <Sun className={iconClass} />
                    ) : (
                      <Moon className={iconClass} />
                    )}

                    {theme === 'dark'
                      ? 'Switch to Light Mode'
                      : 'Switch to Dark Mode'}

                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>

                  <button
                    type="button"
                    className={menuItemClass}
                    onClick={() => navigateTo('terms')}
                  >
                    <FileText className={iconClass} />
                    Terms &amp; Conditions
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition" />
                  </button>

                  {typeof onOpenAdvertiser === 'function' && (
                    <button
                      type="button"
                      className={menuItemClass}
                      onClick={() => runAction(onOpenAdvertiser)}
                    >
                      <Megaphone className={iconClass} />
                      Advertiser
                    </button>
                  )}

                  {typeof onOpenSettings === 'function' && (
                    <button
                      type="button"
                      className={menuItemClass}
                      onClick={() => runAction(onOpenSettings)}
                    >
                      <Settings className={iconClass} />
                      Account Settings
                    </button>
                  )}

                  <button
                    type="button"
                    className={menuItemClass}
                    onClick={openSupport}
                  >
                    <CircleHelp className={iconClass} />
                    Contact &amp; Support
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition" />
                  </button>
                </div>

                <div className="border-t border-slate-800 p-3">
                  {user ? (
                    <button
                      type="button"
                      onClick={() => runAction(onLogout)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runAction(onOpenAuth)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black transition"
                    >
                      Sign In / Register
                    </button>
                  )}
                </div>
              </nav>
            </>
          )}
        </div>

        {/* Earn Plaza logo */}
        <button
          type="button"
          className="font-black text-xl tracking-wide text-white cursor-pointer shrink-0"
          onClick={() => navigateTo('')}
          aria-label="Go to Earn Plaza home"
        >
          Earn<span className="text-emerald-400">Plaza</span>
        </button>

        {/* Account controls */}
        {user ? (
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => runAction(onOpenWallet || onOpenDeposit)}
              className="min-w-0 flex items-center gap-2 bg-slate-900 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition"
              aria-label="Open wallet"
            >
              <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />

              <span className="hidden md:inline text-xs text-slate-400 font-semibold">
                Balance:
              </span>

              <span className="text-sm font-bold text-emerald-400 whitespace-nowrap">
                ${Number(balance || 0).toFixed(2)}
              </span>
            </button>

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
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="shrink-0 text-xs font-bold px-3 sm:px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

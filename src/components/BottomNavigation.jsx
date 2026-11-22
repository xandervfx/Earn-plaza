
import React, { useEffect, useState } from 'react';
import {
  House,
  Zap,
  Users,
  Wallet,
  UserRound,
  Pickaxe
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'earn', label: 'Earn', icon: Zap },
  { id: 'mining', label: 'Mining', icon: Pickaxe },
  { id: 'refer', label: 'Refer', icon: Users },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: UserRound }
];

export default function BottomNavigation() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const updateActiveItem = () => {
      const route = window.location.hash.replace('#', '');

      if (route === 'mining' || route === 'profile') {
        setActive(route);
        return;
      }

      const marker = window.scrollY + window.innerHeight * 0.35;

      if (window.scrollY < 100) {
        setActive('home');
        return;
      }

      const sections = [
        ['wallet', 'wallet-section'],
        ['earn', 'earn-section'],
        ['refer', 'referral-section']
      ];

      const current = sections.find(([id, sectionId]) => {
        const section = document.getElementById(sectionId);
        return section && marker >= section.offsetTop;
      });

      setActive(current?.[0] || 'home');
    };

    window.addEventListener('scroll', updateActiveItem, { passive: true });
    window.addEventListener('hashchange', updateActiveItem);

    updateActiveItem();

    return () => {
      window.removeEventListener('scroll', updateActiveItem);
      window.removeEventListener('hashchange', updateActiveItem);
    };
  }, []);

  const handleNavigation = (id) => {
    setActive(id);

    if (id === 'mining' || id === 'profile') {
      window.location.hash = `#${id}`;
      return;
    }

    if (id === 'home') {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );

      window.dispatchEvent(new HashChangeEvent('hashchange'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionIds = {
      earn: 'earn-section',
      refer: 'referral-section',
      wallet: 'wallet-section'
    };

    document.getElementById(sectionIds[id])?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.25)]"
    >
      <div className="max-w-xl mx-auto grid grid-cols-6 px-1 pt-2 pb-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          const isMining = id === 'mining';

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleNavigation(id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-xl py-2 transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-emerald-400'
                  : isMining
                    ? 'text-emerald-400'
                    : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <span
                className={`flex items-center justify-center rounded-xl transition-all duration-300 ${
                  isMining
                    ? 'p-1.5 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : `p-1.5 ${isActive ? 'bg-emerald-500/15 scale-110' : ''}`
                }`}
              >
                <Icon
                  className={`transition-all duration-300 ${
                    isMining
                      ? 'w-7 h-7 text-emerald-400 drop-shadow-[0_0_7px_rgba(52,211,153,1)] animate-pulse'
                      : 'w-5 h-5'
                  }`}
                  strokeWidth={isMining ? 2.8 : isActive ? 2.5 : 2}
                />
              </span>

              <span
                className={`text-[10px] ${
                  isActive || isMining
                    ? 'font-extrabold text-emerald-400'
                    : 'font-medium'
                }`}
              >
                {label}
              </span>

              <span
                className={`absolute top-0 h-0.5 rounded-full bg-emerald-400 transition-all ${
                  isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}


import React, { useEffect, useState } from 'react';
import {
  House,
  Zap,
  Users,
  Wallet,
  UserRound
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'earn', label: 'Earn', icon: Zap },
  { id: 'refer', label: 'Refer', icon: Users },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: UserRound }
];

export default function BottomNavigation() {
  const [active, setActive] = useState('home');

  useEffect(() => {
    const updateActiveItem = () => {
      const marker = window.scrollY + window.innerHeight * 0.35;

      if (window.scrollY < 100) {
        setActive('home');
        return;
      }

      const wallet = document.getElementById('wallet-section');
      const earn = document.getElementById('earn-section');
      const refer = document.getElementById('referral-section');

      if (wallet && marker >= wallet.offsetTop) {
        setActive('wallet');
      } else if (earn && marker >= earn.offsetTop) {
        setActive('earn');
      } else if (refer && marker >= refer.offsetTop) {
        setActive('refer');
      } else {
        setActive('home');
      }
    };

    window.addEventListener('scroll', updateActiveItem, {
      passive: true
    });

    updateActiveItem();

    return () => {
      window.removeEventListener('scroll', updateActiveItem);
    };
  }, []);

  const handleNavigation = (id) => {
    setActive(id);

    if (id === 'profile') {
      window.location.hash = '#profile';
      return;
    }

    if (id === 'home') {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );

      window.dispatchEvent(new HashChangeEvent('hashchange'));

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      return;
    }

    const sectionIds = {
      earn: 'earn-section',
      refer: 'referral-section',
      wallet: 'wallet-section'
    };

    const section = document.getElementById(sectionIds[id]);

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.25)]"
    >
      <div className="max-w-xl mx-auto grid grid-cols-5 px-2 pt-2 pb-3">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => handleNavigation(id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl py-2 transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-emerald-400'
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              <span
                className={`flex items-center justify-center rounded-xl p-1.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/15 scale-110'
                    : 'scale-100'
                }`}
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </span>

              <span
                className={`text-[10px] transition-all duration-200 ${
                  isActive ? 'font-extrabold' : 'font-medium'
                }`}
              >
                {label}
              </span>

              <span
                className={`absolute top-0 h-0.5 rounded-full bg-emerald-400 transition-all duration-200 ${
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

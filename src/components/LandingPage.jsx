import React from 'react';
import {
  ArrowRight, Sparkles, ShieldCheck, TrendingUp
} from 'lucide-react';

import heroBgImage from '../assets/earnplaza bckgd image.jpeg';
import previewImage from '../assets/earnplaza 2nd bckgd image.jpeg';

export default function LandingPage({ onOpenLogin, onOpenRegister }) {
  return (
    <div className="w-full min-h-screen min-w-0 overflow-x-clip bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-slate-950">

      {/* NAVIGATION HEADER */}
      <nav className="sticky top-0 z-50 w-full max-w-full border-b border-slate-800/80 bg-slate-950/80 px-3 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-2">

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <img
              src="/earnplaza logo.png"
              alt="EarnPlaza Logo"
              className="h-8 w-auto max-w-10 shrink-0 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="whitespace-nowrap text-lg font-black tracking-wide sm:text-xl">
              Earn<span className="text-emerald-400">Plaza</span>
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button
              onClick={onOpenLogin}
              className="whitespace-nowrap rounded-lg px-2 py-2 text-xs font-bold text-slate-300 transition hover:text-white sm:px-4 sm:text-sm"
            >
              Sign In
            </button>
            <button
              onClick={onOpenRegister}
              className="whitespace-nowrap rounded-xl bg-emerald-400 px-3 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-300 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Get Started
            </button>
          </div>

        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative isolate w-full max-w-full overflow-hidden border-b border-slate-800/50 px-4 py-14 sm:px-8 sm:py-24">

        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${heroBgImage})` }}
        />

        <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-64 w-64 max-w-full rounded-full bg-emerald-500/10 blur-3xl sm:h-96 sm:w-96" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-64 w-64 max-w-full rounded-full bg-cyan-500/10 blur-3xl sm:right-1/4 sm:h-96 sm:w-96" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl min-w-0 grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">

          {/* HERO TEXT */}
          <div className="min-w-0 space-y-6 text-center lg:col-span-7 lg:text-left">

            <div className="mx-auto inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 lg:mx-0">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>#1 Micro-Task Earnings Network</span>
            </div>

            <h1 className="break-words text-3xl font-black leading-tight tracking-tight sm:text-6xl">
              Turn Spare Time Into{' '}
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Real Daily Income.
              </span>
            </h1>

            <p className="mx-auto max-w-xl break-words text-sm leading-relaxed text-slate-300 sm:text-lg lg:mx-0">
              Complete simple online tasks, test apps, take surveys, and earn instant cashouts sent directly to your bank account or crypto wallet.
            </p>

            <div className="flex min-w-0 flex-col items-stretch justify-center gap-4 pt-4 sm:flex-row sm:items-center lg:justify-start">
              <button
                onClick={onOpenRegister}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 px-6 py-4 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-teal-300 active:translate-y-0 sm:w-auto sm:px-8"
              >
                <span>Create Free Account</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-2 border-t border-slate-800/80 pt-8 sm:gap-4 lg:mx-0">
              <div className="min-w-0">
                <p className="break-words text-xl font-black text-white sm:text-2xl">$150K+</p>
                <p className="text-[10px] leading-snug text-slate-400 sm:text-xs">Total Paid Out</p>
              </div>
              <div className="min-w-0">
                <p className="break-words text-xl font-black text-white sm:text-2xl">50K+</p>
                <p className="text-[10px] leading-snug text-slate-400 sm:text-xs">Active Earners</p>
              </div>
              <div className="min-w-0">
                <p className="break-words text-xl font-black text-white sm:text-2xl">Instant</p>
                <p className="text-[10px] leading-snug text-slate-400 sm:text-xs">Withdrawals</p>
              </div>
            </div>
          </div>

          {/* PREVIEW IMAGE */}
          <div className="relative min-w-0 w-full lg:col-span-5">
            <div className="relative min-w-0 rounded-3xl border border-slate-800 bg-slate-900 p-2 shadow-2xl sm:p-3">
              <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-950 sm:h-96">
                <img
                  src={previewImage}
                  alt="EarnPlaza Preview"
                  className="h-full w-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              </div>

              <div className="absolute bottom-4 left-3 right-3 flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-950/95 p-3 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6 sm:gap-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  <div className="shrink-0 rounded-xl bg-emerald-500/10 p-2 text-emerald-400 sm:p-2.5">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">Verified Cashout</p>
                    <p className="break-words text-[10px] text-slate-400 sm:text-[11px]">Sarah M. • $45.00 Transferred</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-400 sm:px-2.5 sm:text-[10px]">
                  Completed
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center sm:mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">3 Simple Steps</h2>
          <p className="break-words text-2xl font-black text-white sm:text-3xl">How EarnPlaza Works</p>
          <p className="text-sm text-slate-400">Start making extra cash in less than 5 minutes.</p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          <div className="relative min-w-0 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-slate-700 sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-lg font-bold text-emerald-400">1</div>
            <h3 className="mb-2 text-lg font-bold text-white">Create an Account</h3>
            <p className="break-words text-sm leading-relaxed text-slate-400">Sign up free in seconds with just your email address—no fees or hidden requirements.</p>
          </div>

          <div className="relative min-w-0 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-slate-700 sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-lg font-bold text-teal-400">2</div>
            <h3 className="mb-2 text-lg font-bold text-white">Complete Micro-Tasks</h3>
            <p className="break-words text-sm leading-relaxed text-slate-400">Choose from dozens of daily micro-tasks, app tests, surveys, and promotional offers.</p>
          </div>

          <div className="relative min-w-0 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-slate-700 sm:p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-lg font-bold text-cyan-400">3</div>
            <h3 className="mb-2 text-lg font-bold text-white">Cash Out Earnings</h3>
            <p className="break-words text-sm leading-relaxed text-slate-400">Request immediate payout directly to your preferred bank account once reaching minimum threshold.</p>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="w-full max-w-full px-4 py-12 sm:px-8 sm:py-16">
        <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 text-center shadow-2xl sm:p-14">
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="break-words text-2xl font-black text-white sm:text-4xl">Ready to Start Earning Today?</h2>
            <p className="text-sm text-slate-300 sm:text-base">Join thousands of active earners on EarnPlaza and withdraw your earnings whenever you want.</p>
            <button
              onClick={onOpenRegister}
              className="max-w-full rounded-2xl bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 sm:px-8"
            >
              Create Account Now
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full max-w-full border-t border-slate-900 px-4 py-8 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} EarnPlaza. All rights reserved.</p>
      </footer>

    </div>
  );
}
// src/components/HeroBanner.jsx
import React from 'react';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';

// Recommended: Import directly so Vite/Webpack resolves the asset path correctly in build mode
import heroBgImage from '../assets/earnplaza 2nd bckgd image.jpeg';

export default function HeroBanner({ user }) {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 border border-slate-800">
      
      {/* 1. Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
        style={{ 
          backgroundImage: `url(${heroBgImage})`
        }}
      />

      {/* 2. Gradient Overlay for Contrast & Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-emerald-950/80" />

      {/* 3. Hero Content Layer */}
      <div className="relative z-10 px-6 py-10 md:px-10 md:py-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        <div className="max-w-xl">
          {/* Welcome Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Welcome back to EarnPlaza, {user?.name || 'Partner'}!</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-white leading-tight">
            Complete Simple Tasks, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Grow Your Wallet Daily.
            </span>
          </h2>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
            Pick from dozens of active surveys, tests, and data tasks. Real-time crediting, zero hidden fees, and instant payouts to your account.
          </p>

          {/* Quick Perks */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified Employers</span>
            </div>
          </div>
        </div>

        {/* Floating Quick Action Card */}
        <div className="w-full md:w-auto bg-white/10 backdrop-blur-xl border border-white/15 p-5 rounded-2xl shadow-xl flex flex-col items-center text-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Referral Tier
          </span>
          <span className="text-2xl font-black text-white">
            10% Commission
          </span>
          <p className="text-xs text-slate-300 max-w-[180px]">
            Earn forever from every task your invited friends complete.
          </p>
        </div>

      </div>
    </div>
  );
}
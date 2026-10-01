// src/components/LandingPage.jsx
import React from 'react';
import { 
  ArrowRight, Sparkles, ShieldCheck, Zap, TrendingUp, 
  CheckCircle2, Wallet, Users, Clock, Award, Star
} from 'lucide-react';

// Import background images safely so Vite/Webpack processes them for production builds
import heroBgImage from '../assets/earnplaza bckgd image.jpeg';
import previewImage from '../assets/earnplaza 2nd bckgd image.jpeg';

export default function LandingPage({ onOpenLogin, onOpenRegister }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ---------------- NAVIGATION HEADER ---------------- */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/earnplaza logo.png" 
              alt="EarnPlaza Logo" 
              className="h-8 w-auto object-contain" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="text-xl font-black tracking-wide">
              Earn<span className="text-emerald-400">Plaza</span>
            </span>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onOpenRegister}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Get Started
            </button>
          </div>

        </div>
      </nav>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-800/50">
        
        {/* Background Grid & Glows */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBgImage})`
          }}
        />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>#1 Micro-Task Earnings Network</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight">
              Turn Spare Time Into <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Real Daily Income.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Complete simple online tasks, test apps, take surveys, and earn instant cashouts sent directly to your bank account or crypto wallet.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={onOpenRegister}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-black text-white">$150K+</p>
                <p className="text-xs text-slate-400">Total Paid Out</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">50K+</p>
                <p className="text-xs text-slate-400">Active Earners</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">Instant</p>
                <p className="text-xs text-slate-400">Withdrawals</p>
              </div>
            </div>
          </div>

          {/* Right Visual Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl p-3 bg-slate-900 border border-slate-800 shadow-2xl">
              <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden bg-slate-950">
                <img 
                  src={previewImage} 
                  alt="EarnPlaza Preview"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              </div>

              {/* Floating Widget */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Verified Cashout</p>
                    <p className="text-[11px] text-slate-400">Sarah M. • $45.00 Transferred</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Completed
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">3 Simple Steps</h2>
          <p className="text-3xl font-black text-white">How EarnPlaza Works</p>
          <p className="text-slate-400 text-sm">Start making extra cash in less than 5 minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-6">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Create an Account</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sign up free in seconds with just your email address—no fees or hidden requirements.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition relative">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg mb-6">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Complete Micro-Tasks</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Choose from dozens of daily micro-tasks, app tests, surveys, and promotional offers.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition relative">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg mb-6">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cash Out Earnings</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Request immediate payout directly to your preferred bank account once reaching minimum threshold.
            </p>
          </div>

        </div>
      </section>

      {/* ---------------- BOTTOM CTA BANNER ---------------- */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Ready to Start Earning Today?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Join thousands of active earners on EarnPlaza and withdraw your earnings whenever you want.
            </p>
            <button
              onClick={onOpenRegister}
              className="px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition cursor-pointer"
            >
              Create Account Now
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} EarnPlaza. All rights reserved.</p>
      </footer>

    </div>
  );
}
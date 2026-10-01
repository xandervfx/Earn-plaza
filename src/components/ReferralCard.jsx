// src/components/ReferralCard.jsx
import React, { useState, useEffect } from 'react';
import { Copy, Check, Users, Gift } from 'lucide-react';

export default function ReferralCard({ user }) {
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    referralCode: user?.referral_code || '',
    referralLink: '',
    totalReferrals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferralStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://localhost:5000/api/user/referrals', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load referral stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReferralStats();
  }, [user]);

  const referralLink = stats.referralLink || `http://localhost:5173/register?ref=${stats.referralCode || user?.referral_code || ''}`;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mt-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Side: Info */}
        <div className="space-y-1 max-w-lg">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-4 h-4" />
            <span>EarnPlaza Referral Program</span>
          </div>
          <h2 className="text-xl font-black text-white">Invite Friends & Unlock Withdrawals</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Share your unique referral link with your network. You need at least <strong className="text-white">3 active referrals</strong> to request cash withdrawals.
          </p>
        </div>

        {/* Right Side: Stats & Link Box */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          
          {/* Referral Counter Badge */}
          <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Your Referrals</p>
              <p className="text-lg font-black text-white">
                {loading ? '...' : `${stats.totalReferrals} / 3`}
              </p>
            </div>
          </div>

          {/* Copy Link Input Group */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1.5 focus-within:border-emerald-500/50 transition">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="bg-transparent text-xs text-slate-300 px-3 py-1 outline-none w-full md:w-56 font-mono truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md shadow-emerald-500/10"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
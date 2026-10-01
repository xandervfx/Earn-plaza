// src/components/ForgotPasswordModal.jsx
import React, { useState } from 'react';
import { Mail, KeyRound, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { API_BASE } from './config';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // Step 1: Send OTP | Step 2: Reset Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Step 1: Request 6-digit OTP code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send verification code.');

      setSuccessMsg(data.message);
      setStep(2); // Advance to OTP verification
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Password reset failed.');

      setSuccessMsg('Password reset successfully! You can now log in.');
      setTimeout(() => {
        onClose();
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md text-white shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-1">Reset Your Password</h2>
        <p className="text-xs text-slate-400 mb-6">
          {step === 1 ? 'Enter your email address to receive a 6-digit verification code.' : 'Enter the code sent to your email and choose a new password.'}
        </p>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl mb-4">{error}</div>}
        {successMsg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{successMsg}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
                <Mail className="w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@example.com" 
                  className="bg-transparent text-sm text-white w-full outline-none"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit Verification Code</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
                <KeyRound className="w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  required 
                  maxLength={6}
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="123456" 
                  className="bg-transparent text-sm text-white w-full outline-none font-mono tracking-widest"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5">
                <KeyRound className="w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  required 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="bg-transparent text-sm text-white w-full outline-none"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Resetting Password...' : 'Confirm Password Reset'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
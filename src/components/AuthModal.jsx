// src/components/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Gift,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenForgotPassword,
}) {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Automatically read referral codes from invite links.
  useEffect(() => {
    if (!isOpen) return;

    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');

    if (refParam) {
      setFormData((prev) => ({
        ...prev,
        referralCode: refParam,
      }));
      setMode('register');
    }
  }, [isOpen]);

  // Reset visibility when the modal closes or changes mode.
  useEffect(() => {
    setShowPassword(false);
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'register' && !formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    const endpoint =
      mode === 'register'
        ? '/api/auth/register'
        : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Authentication failed.'
        );
      }

      const token = data.token || data.user?.token;

      if (!token) {
        throw new Error(
          'Authentication token missing from server response.'
        );
      }

      localStorage.setItem('token', token);

      onLoginSuccess(data.user || data);

      setFormData({
        name: '',
        email: '',
        password: '',
        referralCode: '',
      });

      setShowPassword(false);
      onClose();
    } catch (err) {
      setError(
        err.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 text-white">

        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/50 relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication window"
            className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Welcome to EarnPlaza
            </span>
          </div>

          <h2 className="text-2xl font-black text-white">
            {mode === 'login'
              ? 'Sign in to your account'
              : 'Create your account'}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Access your micro-tasks, wallet balance, and referral stats.'
              : 'Join thousands of workers earning daily micro-payouts.'}
          </p>

          {/* Login / Register tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 mt-5">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Authentication form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4"
        >
          {/* Full name */}
          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-name"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>

              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                <input
                  id="auth-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Sarah Jenkins"
                  autoComplete="name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

              <input
                id="auth-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="sarah@example.com"
                autoComplete="email"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Password with visible eye toggle */}
          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>

            <div className="relative w-full">
              <Lock
                aria-hidden="true"
                className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              />

              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete={
                  mode === 'login'
                    ? 'current-password'
                    : 'new-password'
                }
                className="block w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-14 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />

              <button
                type="button"
                onClick={() => {
                  setShowPassword((current) => !current);
                }}
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
                aria-pressed={showPassword}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 bg-slate-900 hover:text-emerald-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                style={{
                  display: 'flex',
                  visibility: 'visible',
                  opacity: 1,
                }}
              >
                {showPassword ? (
                  /* Inline SVG: hide password */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{
                      display: 'block',
                      width: '22px',
                      height: '22px',
                    }}
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a15.5 15.5 0 0 1-3 3.8" />
                    <path d="M6.2 6.2C3.9 7.8 2 12 2 12s3.5 7 10 7a10.5 10.5 0 0 0 4-.8" />
                  </svg>
                ) : (
                  /* Inline SVG: show password */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{
                      display: 'block',
                      width: '22px',
                      height: '22px',
                    }}
                  >
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          {mode === 'login' && (
            <div className="flex justify-end mt-1 mb-2">
              <button
                type="button"
                onClick={() => {
                  onClose();

                  if (onOpenForgotPassword) {
                    onOpenForgotPassword();
                  }
                }}
                className="text-xs text-slate-400 hover:text-emerald-400 transition underline underline-offset-4 cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Optional referral code */}
          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-referral"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Referral Code (Optional)
              </label>

              <div className="relative">
                <Gift className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

                <input
                  id="auth-referral"
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  placeholder="e.g. EP-7709X"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="text-rose-400 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition disabled:opacity-50 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? 'Sign In to Dashboard'
                    : 'Create Free Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
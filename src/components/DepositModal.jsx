import React, { useState } from 'react';
import { Wallet, ArrowLeft, ShieldCheck, AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react';
import { API_BASE } from './config';

export default function DepositModal({
  isOpen = true,
  onClose = () => {},
  onSuccess,
  standalone = false
}) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceId, setReferenceId] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!standalone && !isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const numericAmount = Number(amount);

    if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid deposit amount greater than zero.');
      return;
    }

    if (!referenceId.trim()) {
      setError('Please enter your transaction reference ID.');
      return;
    }

    if (proofUrl.trim()) {
      try {
        const parsedUrl = new URL(proofUrl);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Invalid URL');
        }
      } catch {
        setError('Enter a valid proof URL, or leave it empty.');
        return;
      }
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setError('Your session has expired. Please log in again.');
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/user/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: numericAmount,
          paymentMethod,
          reference: referenceId.trim(),
          proofUrl: proofUrl.trim()
        })
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : {};

      if (!response.ok) {
        throw new Error(
          data.error || data.message || `Deposit request failed (${response.status}).`
        );
      }

      const message = data.message || 'Deposit request submitted successfully. Your deposit may require admin verification before your balance is credited.';

      setSuccess(message);
      setAmount('');
      setReferenceId('');
      setProofUrl('');

      if (onSuccess) onSuccess(message);

      if (!standalone) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Could not submit your deposit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 transition';

  const labelClass =
    'block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2';

  return (
    <div
      className={
        standalone
          ? 'min-h-screen w-full bg-slate-950 text-white px-4 py-6 sm:px-6 sm:py-10'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'
      }
    >
      <section
        className={`w-full max-w-xl mx-auto ${
          standalone
            ? 'space-y-6'
            : 'bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl'
        }`}
      >
        {standalone && (
          <button
            type="button"
            onClick={() => {
              window.location.hash = '';
            }}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Deposit Funds
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Submit your payment details for verification.
              </p>
            </div>
            {!standalone && (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto text-slate-400 hover:text-white text-sm"
              >
                Close
              </button>
            )}
          </div>

          <div className="flex gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-6">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />
            <p className="text-xs leading-5 text-slate-300">
              Always use the correct transaction reference. Your request may remain pending until an administrator verifies your payment.
            </p>
          </div>

          {error && (
            <div role="alert" className="flex gap-2 items-start bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl text-sm mb-4 break-words">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div role="status" className="flex gap-2 items-start bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3 rounded-xl text-sm mb-4 break-words">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="deposit-amount" className={labelClass}>
                Deposit Amount (USD)
              </label>
              <input
                id="deposit-amount"
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="50.00"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="deposit-method" className={labelClass}>
                Payment Method
              </label>
              <select
                id="deposit-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Crypto (USDT)">Crypto (USDT)</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>

            <div>
              <label htmlFor="deposit-reference" className={labelClass}>
                Transaction Reference / ID
              </label>
              <input
                id="deposit-reference"
                type="text"
                maxLength={200}
                value={referenceId}
                onChange={(e) => {
                  setReferenceId(e.target.value);
                  setError('');
                }}
                placeholder="Enter your transaction reference"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="deposit-proof" className={labelClass}>
                Proof URL <span className="normal-case font-normal">(Optional)</span>
              </label>
              <input
                id="deposit-proof"
                type="url"
                value={proofUrl}
                onChange={(e) => {
                  setProofUrl(e.target.value);
                  setError('');
                }}
                placeholder="https://example.com/receipt"
                className={inputClass}
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Provide a link to your payment receipt if available.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Submit Deposit Request'
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
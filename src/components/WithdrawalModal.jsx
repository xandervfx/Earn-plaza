
import React, { useState, useEffect } from 'react';
import {
  X,
  AlertCircle,
  Wallet,
  ArrowRight,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { API_BASE } from './config';

const NIGERIAN_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Globus Bank',
  'Guaranty Trust Bank (GTB)',
  'Heritage Bank',
  'Jaiz Bank',
  'Keystone Bank',
  'Kuda Bank',
  'Moniepoint MFB',
  'OPay Digital Services',
  'Palmpay',
  'Polaris Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'Suntrust Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Unity Bank',
  'Wema Bank',
  'Zenith Bank'
];

const PAYOUT_METHODS = [
  { id: 'Bank Transfer', label: 'Bank Transfer' },
  { id: 'PayPal', label: 'PayPal' },
  { id: 'USDT (Crypto)', label: 'USDT (Crypto - TRC20/ERC20)' },
  { id: 'Gift Card', label: 'Gift Card (Amazon / Google Play)' }
];

const MIN_WITHDRAWAL = 10;
const REQUIRED_REFERRALS = 3;

export default function WithdrawalModal({
  isOpen = true,
  onClose = () => {},
  user,
  balance = 0,
  onWithdrawSuccess,
  standalone = false
}) {
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer');
  const [accountName, setAccountName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [bankName, setBankName] = useState(NIGERIAN_BANKS[0]);
  const [destinationDetail, setDestinationDetail] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userReferrals, setUserReferrals] = useState(0);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);

  const pageIsActive = standalone || isOpen;

useEffect(() => {
  if (!pageIsActive) return;

  let cancelled = false;

  const fetchLiveReferralCount = async () => {
    setIsLoadingReferrals(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Please log in to continue.');
      }

      const res = await fetch(`${API_BASE}/api/user/referrals`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.error || data.message || 'Unable to load your referral count.'
        );
      }

      if (!cancelled) {
        setUserReferrals(Number(data.totalReferrals) || 0);
      }
    } catch (err) {
      if (!cancelled) {
        setError(err.message || 'Unable to load referral information.');
      }
    } finally {
      if (!cancelled) {
        setIsLoadingReferrals(false);
      }
    }
  };

  fetchLiveReferralCount();

  return () => {
    cancelled = true;
  };
}, [pageIsActive, user?.id]);

  useEffect(() => {
    if (standalone || !isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [standalone, isOpen, onClose]);

  const numAmount = Number(amount) || 0;
  const fee = numAmount * 0.25;
  const netAmount = Math.max(0, numAmount - fee);

  const handleWithdraw = async (event) => {
    event.preventDefault();

    if (isProcessing) return;

    if (isLoadingReferrals) {
      setError('Please wait while we check your referral count.');
      return;
    }

    if (userReferrals < REQUIRED_REFERRALS) {
      setError(
        `You need at least ${REQUIRED_REFERRALS} referrals to withdraw. Current referrals: ${userReferrals}.`
      );
      return;
    }

    if (!Number.isFinite(numAmount) || numAmount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal amount is $${MIN_WITHDRAWAL.toFixed(2)}.`);
      return;
    }

    if (numAmount > Number(balance)) {
      setError('Withdrawal amount exceeds your available balance.');
      return;
    }

    if (!user) {
      setError('Please log in before requesting a withdrawal.');
      return;
    }

    let fullAccountDetails = '';

    if (payoutMethod === 'Bank Transfer') {
      if (!accountName.trim() || !/^\d{10}$/.test(accountNo)) {
        setError('Enter the account name and a valid 10-digit account number.');
        return;
      }

      fullAccountDetails =
        `Bank: ${bankName} | Acc No: ${accountNo} | Name: ${accountName.trim()}`;
    } else {
      if (!destinationDetail.trim()) {
        setError(`Please provide your ${payoutMethod} details.`);
        return;
      }

      fullAccountDetails = `${payoutMethod}: ${destinationDetail.trim()}`;
    }

    if (typeof onWithdrawSuccess !== 'function') {
      setError('Withdrawal submission is not configured. Please contact support.');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      await onWithdrawSuccess({
        amount: numAmount,
        netAmount,
        method: payoutMethod,
        accountDetails: fullAccountDetails
      });

      setAmount('');
      setAccountName('');
      setAccountNo('');
      setDestinationDetail('');

      if (standalone) {
        window.location.hash = '';
      } else {
        onClose();
      }
    } catch (err) {
      setError(err?.message || 'Failed to submit withdrawal request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!standalone && !isOpen) return null;

  const content = (
    <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl">
      <div className="flex justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black">
              Request Payout
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Available balance:{' '}
              <span className="text-emerald-400 font-bold">
                ${Number(balance).toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        {!standalone && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close withdrawal"
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-sm text-amber-300 mb-6">
        <p className="font-bold flex items-center gap-2 text-amber-400 mb-3">
          <AlertCircle className="w-4 h-4" />
          Payout Terms & Requirements
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            Minimum withdrawal:{' '}
            <strong>${MIN_WITHDRAWAL.toFixed(2)}</strong>
          </div>

          <div>
            Processing fee: <strong>25%</strong>
          </div>

          <div className="sm:col-span-2">
            Required referrals:{' '}
            <strong
              className={
                userReferrals >= REQUIRED_REFERRALS
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }
            >
              {isLoadingReferrals
                ? 'Checking...'
                : `${userReferrals} / ${REQUIRED_REFERRALS}`}
            </strong>
          </div>
        </div>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-5">
        <div>
          <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-2">
            Payout Method
          </label>

          <select
            value={payoutMethod}
            onChange={(event) => {
              setPayoutMethod(event.target.value);
              setError('');
            }}
            className="w-full bg-slate-950 border border-slate-700 p-3.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
          >
            {PAYOUT_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        {payoutMethod === 'Bank Transfer' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-2">
                Select Bank
              </label>

              <select
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                className="w-full bg-slate-950 border border-slate-700 p-3.5 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                {NIGERIAN_BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-2">
                Account Number
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={accountNo}
                onChange={(event) =>
                  setAccountNo(event.target.value.replace(/\D/g, ''))
                }
                placeholder="10-digit account number"
                className="w-full bg-slate-950 border border-slate-700 p-3.5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-2">
                Account Name
              </label>

              <input
                type="text"
                value={accountName}
                onChange={(event) => setAccountName(event.target.value)}
                placeholder="Full name on bank account"
                maxLength={100}
                className="w-full bg-slate-950 border border-slate-700 p-3.5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-2">
              {payoutMethod === 'PayPal'
                ? 'PayPal Email Address'
                : payoutMethod === 'USDT (Crypto)'
                  ? 'USDT Wallet Address (TRC20 / ERC20)'
                  : 'Gift Card Type & Delivery Details'}
            </label>

            <input
              type="text"
              value={destinationDetail}
              onChange={(event) => setDestinationDetail(event.target.value)}
              placeholder={
                payoutMethod === 'PayPal'
                  ? 'user@example.com'
                  : payoutMethod === 'USDT (Crypto)'
                    ? 'Enter your wallet address'
                    : 'e.g. Amazon gift card'
              }
              className="w-full bg-slate-950 border border-slate-700 p-3.5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs text-slate-300 font-bold uppercase tracking-wider mb-2">
            Withdrawal Amount (USD)
          </label>

          <input
            type="number"
            step="0.01"
            min={MIN_WITHDRAWAL}
            max={Number(balance)}
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              setError('');
            }}
            placeholder="10.00"
            className="w-full bg-slate-950 border border-slate-700 p-3.5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
          />

          {numAmount > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Requested amount</span>
                <span>${numAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>25% fee</span>
                <span>${fee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold border-t border-slate-800 pt-2">
                <span>Estimated payout</span>
                <span className="text-emerald-400">
                  ${netAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing || isLoadingReferrals}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Submitting Request...' : 'Confirm Cashout Request'}
          {!isProcessing && <ArrowRight className="w-4 h-4" />}
        </button>

        <p className="text-xs text-slate-500 text-center leading-relaxed">
          <ShieldCheck className="w-4 h-4 inline mr-1 text-emerald-400" />
          Your request is submitted for backend processing. Only the server can
          confirm its status.
        </p>
      </form>
    </div>
  );

  if (standalone) {
    return (
      <main className="min-h-screen bg-slate-950 text-white px-4 py-6 sm:px-6 sm:py-10">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '';
            }}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="mb-6">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">
              Earn Plaza Wallet
            </p>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              Withdraw Earnings
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Review your payout details before submitting your request.
            </p>
          </div>

          {content}
        </div>
      </main>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      onClick={(event) =>
        event.target === event.currentTarget && onClose()
      }
    >
      <div className="w-full max-h-[95vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
}

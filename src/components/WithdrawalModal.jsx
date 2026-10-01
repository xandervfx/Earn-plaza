// src/components/WithdrawalModal.jsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Wallet, ArrowRight } from 'lucide-react';

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

export default function WithdrawalModal({ isOpen, onClose, user, balance = 0, onWithdrawSuccess }) {
  const [payoutMethod, setPayoutMethod] = useState('Bank Transfer');
  const [accountName, setAccountName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [bankName, setBankName] = useState(NIGERIAN_BANKS[0]);
  const [destinationDetail, setDestinationDetail] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Dynamic state for live referral count
  const [userReferrals, setUserReferrals] = useState(0);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);

  // Fetch live referral count whenever modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchLiveReferralCount = async () => {
      setIsLoadingReferrals(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:5000/api/user/referrals', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserReferrals(data.totalReferrals || 0);
        }
      } catch (err) {
        console.error('Failed to load referral count for modal:', err);
      } finally {
        setIsLoadingReferrals(false);
      }
    };

    fetchLiveReferralCount();
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * 0.25;
  const netAmount = Math.max(0, numAmount - fee);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (isProcessing) return;

    // Check referral requirement dynamically
    if (userReferrals < REQUIRED_REFERRALS) {
      setError(`You need at least ${REQUIRED_REFERRALS} referrals to withdraw (Current: ${userReferrals}).`);
      return;
    }

    if (isNaN(numAmount) || numAmount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal amount is $${MIN_WITHDRAWAL.toFixed(2)}.`);
      return;
    }

    if (numAmount > balance) {
      setError('Withdrawal amount exceeds your current available balance.');
      return;
    }

    let fullAccountDetails = '';
    if (payoutMethod === 'Bank Transfer') {
      if (!accountName.trim() || !accountNo.trim()) {
        setError('Please complete all bank account details.');
        return;
      }
      fullAccountDetails = `Bank: ${bankName} | Acc No: ${accountNo} | Name: ${accountName}`;
    } else {
      if (!destinationDetail.trim()) {
        setError(`Please provide your ${payoutMethod} details.`);
        return;
      }
      fullAccountDetails = `${payoutMethod}: ${destinationDetail.trim()}`;
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
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to submit withdrawal request. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white relative shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Request Payout</h3>
              <p className="text-xs text-slate-400">Balance: <span className="text-emerald-400 font-bold">${Number(balance).toFixed(2)}</span></p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Rules & Requirements Banner */}
        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-xs text-amber-300 mb-5 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-400 mb-1">
            <AlertCircle className="w-4 h-4" /> Payout Terms & Rules
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-amber-500/20">
            <div>• Min. Cashout: <strong>${MIN_WITHDRAWAL.toFixed(2)}</strong></div>
            <div>• Admin Fee: <strong>25%</strong></div>
            <div className="col-span-2">
              • Referrals: <strong className={userReferrals >= REQUIRED_REFERRALS ? 'text-emerald-400' : 'text-rose-400'}>
                {isLoadingReferrals ? 'Checking...' : `${userReferrals} / ${REQUIRED_REFERRALS} Completed`}
              </strong>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
          
          {/* Method Selection */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">Payout Method</label>
            <select 
              value={payoutMethod} 
              onChange={e => setPayoutMethod(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              {PAYOUT_METHODS.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">{m.label}</option>
              ))}
            </select>
          </div>

          {/* Conditional Input Fields */}
          {payoutMethod === 'Bank Transfer' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">Select Bank</label>
                <select 
                  value={bankName} 
                  onChange={e => setBankName(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                >
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank} value={bank} className="bg-slate-900 text-white">{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">Account Number</label>
                <input 
                  type="text" 
                  maxLength={10}
                  value={accountNo} 
                  onChange={e => setAccountNo(e.target.value.replace(/\D/g, ''))} 
                  placeholder="10-digit account number" 
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition" 
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">Account Name</label>
                <input 
                  type="text" 
                  value={accountName} 
                  onChange={e => setAccountName(e.target.value)} 
                  placeholder="Full name on bank account" 
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition" 
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                {payoutMethod === 'PayPal' && 'PayPal Email Address'}
                {payoutMethod === 'USDT (Crypto)' && 'USDT Wallet Address (TRC20 / ERC20)'}
                {payoutMethod === 'Gift Card' && 'Gift Card Type & Delivery Email'}
              </label>
              <input 
                type="text" 
                value={destinationDetail} 
                onChange={e => setDestinationDetail(e.target.value)} 
                placeholder={
                  payoutMethod === 'PayPal' ? 'user@example.com' :
                  payoutMethod === 'USDT (Crypto)' ? 'T...' : 'e.g., Amazon - user@example.com'
                } 
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition" 
              />
            </div>
          )}

          {/* Amount Input & Fee Calculation */}
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1.5">Amount ($)</label>
            <input 
              type="number" 
              step="0.01" 
              min={MIN_WITHDRAWAL}
              value={amount} 
              onChange={e => {
                setAmount(e.target.value);
                if (error) setError('');
              }} 
              placeholder="10.00"
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition" 
            />
            {numAmount > 0 && (
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 px-1">
                <span>Est. Net Received:</span>
                <span className="font-bold text-emerald-400">${netAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Inline Error Message */}
          {error && (
            <p className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isProcessing || isLoadingReferrals} 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            <span>{isProcessing ? 'Processing Request...' : 'Confirm Cashout Request'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
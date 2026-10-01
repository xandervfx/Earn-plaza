import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DepositModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [referenceId, setReferenceId] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !referenceId) {
      setError('Please fill in both the Amount and Reference ID.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      // Points to /api/user/deposit (singular) and matches backend field names
      const res = await fetch(`${API_BASE_URL}/api/user/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod,
          reference: referenceId,
          proofUrl
        })
      });

      // Prevent crashing if server returns non-JSON HTML error
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned status ${res.status}. Check server logs.`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit deposit');

      setAmount('');
      setReferenceId('');
      setProofUrl('');
      if (onSuccess) onSuccess(data.message || 'Deposit request submitted successfully!');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md text-white">
        <h2 className="text-xl font-bold mb-4">Deposit Funds</h2>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs mb-4 break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Crypto (USDT)">Crypto (USDT)</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Transaction Ref / ID
            </label>
            <input
              type="text"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              placeholder="TXN-12345678"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Proof URL (Optional)
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://imgur.com/your-receipt"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
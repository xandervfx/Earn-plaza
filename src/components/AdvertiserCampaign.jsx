// ==========================================
// src/components/AdvertiserCampaign.jsx
// ==========================================
import React, { useState } from 'react';
import { Megaphone } from 'lucide-react';

export default function AdvertiserCampaign({ user, onBackToSite, onCampaignCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    category: 'social',
    slots: 100,
    costPerSlot: 0.50,
    durationHours: 24,
    paymentMethod: 'balance'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totalCost = (formData.slots * formData.costPerSlot).toFixed(2);
  const userRewardPerTask = (formData.costPerSlot * 0.80).toFixed(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/advertiser/create-task', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          link: formData.link,
          category: formData.category,
          total_slots: formData.slots,
          reward: userRewardPerTask,
          cost_per_slot: formData.costPerSlot,
          expires_in_hours: formData.durationHours,
          paymentMethod: formData.paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create advertiser campaign.');

      setSuccess(`Campaign paid and published successfully! Total Cost: $${totalCost}`);
      setFormData({
        title: '',
        description: '',
        link: '',
        category: 'social',
        slots: 100,
        costPerSlot: 0.50,
        durationHours: 24,
        paymentMethod: 'balance'
      });
      
      if (onCampaignCreated) {
        onCampaignCreated(data.task || data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Advertiser & Premium Ad Payment</h3>
              <p className="text-xs text-slate-400">Fund your ad campaigns, configure slots & timers, and process payments securely.</p>
            </div>
          </div>
          {onBackToSite && (
            <button 
              onClick={onBackToSite}
              className="bg-slate-800 hover:bg-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              ← Back to App
            </button>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl mb-4">{error}</div>}
          {success && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Title</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Subscribe to YouTube Channel & Like Video" 
                value={formData.title} 
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Instructions / Description</label>
              <textarea 
                rows={3} 
                placeholder="Explain what workers need to do to complete your task..." 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Link</label>
                <input 
                  type="url" 
                  placeholder="https://..." 
                  value={formData.link} 
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="social">Social Media</option>
                  <option value="app_test">App Download / Review</option>
                  <option value="engagement">Engagement</option>
                  <option value="surveys">Surveys & Signup</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Total Slots</label>
                <input 
                  type="number" 
                  min={5} 
                  required 
                  value={formData.slots} 
                  onChange={(e) => setFormData({ ...formData, slots: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cost Per Slot ($)</label>
                <input 
                  type="number" 
                  step="0.05" 
                  min="0.10" 
                  required 
                  value={formData.costPerSlot} 
                  onChange={(e) => setFormData({ ...formData, costPerSlot: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Timer (Hours)</label>
                <input 
                  type="number" 
                  min="1" 
                  required 
                  value={formData.durationHours} 
                  onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 24 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method / Checkout</label>
              <select 
                value={formData.paymentMethod} 
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
              >
                <option value="balance">Deduct from Account Balance</option>
                <option value="card">Pay with Card / Gateway (Simulated)</option>
                <option value="crypto">Pay with Crypto / USDT (Simulated)</option>
              </select>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Campaign Payment Required</p>
                <p className="text-xl font-black text-purple-400">${totalCost}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Worker Payout Per Task</p>
                <p className="text-sm font-bold text-emerald-400">${userRewardPerTask} <span className="text-[10px] text-slate-500">(20% platform fee)</span></p>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-purple-600/20"
            >
              {loading ? 'Processing Payment & Launching...' : `Pay $${totalCost} & Launch Ad Campaign`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
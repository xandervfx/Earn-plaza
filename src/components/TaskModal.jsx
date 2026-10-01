// src/components/TaskModal.jsx
import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Send, AlertCircle } from 'lucide-react';

export default function TaskModal({ task, onClose, onSubmitSuccess }) {
  const [proof, setProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset internal state when a new task is opened
  useEffect(() => {
    setProof('');
    setError('');
    setIsSubmitting(false);
  }, [task?.id]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proof.trim()) {
      setError('Please provide the required proof details before submitting.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmitSuccess(task, proof.trim());
    } catch (err) {
      setError(err?.message || 'Failed to submit proof. Please try again.');
      setIsSubmitting(false);
    }
  };

  const safeReward = isNaN(Number(task.reward)) ? 0 : Number(task.reward);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white relative shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Task Header */}
        <div className="mb-4 pr-8">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block mb-2">
            {task.category ? task.category.replace('_', ' ') : 'General'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">{task.title}</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
            {task.description || task.instructions}
          </p>
        </div>

        {/* Reward & Task Link */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reward</p>
            <p className="text-xl font-black text-emerald-400">${safeReward.toFixed(2)}</p>
          </div>
          {task.link && (
            <a
              href={task.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
            >
              <span>Open Task Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Proof Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Submission Proof / Details
            </label>
            <textarea
              rows={3}
              value={proof}
              onChange={(e) => {
                setProof(e.target.value);
                if (error) setError('');
              }}
              placeholder="Paste profile link, username, order ID, or requested proof details..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
            {error && (
              <p className="text-rose-400 text-xs mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? 'Submitting...' : 'Submit Proof for Verification'}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
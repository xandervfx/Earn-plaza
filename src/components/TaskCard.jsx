// src/components/TaskCard.jsx
import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

export default function TaskCard({ task, onClick }) {
  // Category badge styles aligned with dark theme
  const categoryColors = {
    survey: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    data_labeling: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    testing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    social_action: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const safeReward = isNaN(Number(task?.reward)) ? 0 : Number(task.reward);
  const remainingSlots = task?.remaining_slots ?? 
    ((task?.slots || 0) - (task?.slots_claimed || 0));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          {/* Category Badge */}
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
              categoryColors[task?.category] || 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {task?.category ? task.category.replace('_', ' ') : 'General'}
          </span>

          {/* Reward Badge */}
          <div className="text-right">
            <span className="text-xl font-black text-emerald-400">${safeReward.toFixed(2)}</span>
            <p className="text-[10px] text-slate-400 font-medium">per completion</p>
          </div>
        </div>

        {/* Task Info */}
        <h3 className="text-base font-bold text-white mb-1 line-clamp-1">{task?.title || 'Untitled Task'}</h3>
        <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {task?.instructions || task?.description || 'No instructions provided.'}
        </p>
      </div>

      {/* Slots & Action */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
          <span className="text-amber-400">🔥</span> 
          <strong className="text-white">{Math.max(0, remainingSlots)}</strong> slots left
        </span>

        <button
          onClick={onClick}
          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer shadow-md shadow-emerald-500/10"
        >
          Start Task
        </button>
      </div>
    </div>
  );
}
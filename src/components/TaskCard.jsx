
import React from 'react';

const categoryIcons = {
  social:
    'https://static.vecteezy.com/system/resources/previews/032/059/036/non_2x/set-of-social-media-icons-editable-file-free-png.png',
  app_test:
    'https://png.pngtree.com/png-vector/20190505/ourmid/pngtree-vector-apps-icon-png-image_1023269.jpg',
  engagement:
    'https://superawesomevectors.com/wp-content/uploads/2021/01/social-engagement-icon.jpg',
  surveys:
    'https://static.vecteezy.com/system/resources/thumbnails/034/462/989/small/editable-design-icon-of-mobile-survey-vector.jpg',
};

const categoryLabels = {
  social: 'Social Media',
  app_test: 'App Testing',
  engagement: 'Engagement',
  surveys: 'Surveys',
};

const categoryColors = {
  social: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  app_test: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  engagement: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  surveys: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function TaskCard({ task, onClick }) {
  const category = task?.category || '';
  const safeReward = isNaN(Number(task?.reward))
    ? 0
    : Number(task.reward);

  const remainingSlots =
    task?.remaining_slots ??
    ((task?.slots || 0) - (task?.slots_claimed || 0));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {categoryIcons[category] && (
              <img
                src={categoryIcons[category]}
                alt={`${categoryLabels[category] || 'Task'} icon`}
                className="w-10 h-10 object-contain rounded-lg bg-white p-1 shrink-0"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            )}

            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                categoryColors[category] ||
                'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {categoryLabels[category] ||
                (category ? category.replace(/_/g, ' ') : 'General')}
            </span>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xl font-black text-emerald-400">
              ${safeReward.toFixed(2)}
            </span>
            <p className="text-[10px] text-slate-400 font-medium">
              per completion
            </p>
          </div>
        </div>

        <h3 className="text-base font-bold text-white mb-1 line-clamp-1">
          {task?.title || 'Untitled Task'}
        </h3>

        <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {task?.instructions ||
            task?.description ||
            'No instructions provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
          <span className="text-amber-400">🔥</span>
          <strong className="text-white">
            {Math.max(0, remainingSlots)}
          </strong>
          slots left
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

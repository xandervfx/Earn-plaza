// // src/components/DailyCheckinCard.jsx
// import React, { useState } from 'react';
// import { Flame, Check, Lock } from 'lucide-react';
// import { API_BASE } from './config';

// export default function DailyCheckinCard({ user, onRewardClaimed }) {
//   const [loading, setLoading] = useState(false);
  
//   // Adjusted reward scale starting at $0.05
//   const rewards = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35];
  
//   const userId = user?.id || user?.user_id;
//   const currentStreak = user?.streak_count || 0;

//   const handleClaim = () => {
//   if (!userId) return;
//   setLoading(true);

//   fetch(`${API_BASE}/api/user/daily-checkin`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ userId })
//   })
//     .then(async (res) => {
//       const contentType = res.headers.get('content-type');
//       let data;
      
//       // Check if response is valid JSON before parsing
//       if (contentType && contentType.includes('application/json')) {
//         data = await res.json();
//       } else {
//         const text = await res.text();
//         throw new Error(`Server returned status ${res.status}: ${text.slice(0, 100)}`);
//       }

//       if (!res.ok) throw new Error(data.error || 'Could not claim bonus');
//       return data;
//     })
//     .then((data) => {
//       alert(data.message);
//       if (onRewardClaimed) onRewardClaimed(data.newBalance);
//     })
//     .catch((err) => alert(err.message))
//     .finally(() => setLoading(false));
// };
//   return (
//     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
//             <Flame className="w-6 h-6" />
//           </div>
//           <div>
//             <h3 className="text-lg font-bold">Daily Streak Reward</h3>
//             <p className="text-xs text-slate-400">Log in daily starting at $0.05 and build your streak!</p>
//           </div>
//         </div>

//         <button
//           onClick={handleClaim}
//           disabled={loading}
//           className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
//         >
//           {loading ? 'Claiming...' : "Claim Today's Bonus"}
//         </button>
//       </div>

//       {/* 7-Day Visual Tracker */}
//       <div className="grid grid-cols-7 gap-2">
//         {rewards.map((amount, idx) => {
//           const dayNum = idx + 1;
//           const isDone = dayNum <= currentStreak;
//           const isCurrent = dayNum === currentStreak + 1;

//           return (
//             <div
//               key={`streak-day-${dayNum}`}
//               className={`p-3 rounded-xl border text-center transition-all ${
//                 isDone
//                   ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
//                   : isCurrent
//                   ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 ring-2 ring-amber-500/20'
//                   : 'bg-slate-950 border-slate-800 text-slate-500'
//               }`}
//             >
//               <p className="text-[10px] font-bold uppercase mb-1">Day {dayNum}</p>
//               <p className="text-xs font-black mb-2">${amount.toFixed(2)}</p>
//               <div className="flex justify-center">
//                 {isDone ? (
//                   <Check className="w-4 h-4 text-emerald-400" />
//                 ) : isCurrent ? (
//                   <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
//                 ) : (
//                   <Lock className="w-3.5 h-3.5 opacity-40" />
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
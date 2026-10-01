// src/components/TransactionLedger.jsx
import React from 'react';
import { ArrowDownLeft, Gift, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

export default function TransactionLedger({ transactions = [] }) {
  const safeList = Array.isArray(transactions) ? transactions : [];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden mt-10 text-white">
      
      {/* Table Header */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">Earnings & Payout History</h3>
          <p className="text-xs text-slate-400">Track task earnings, referral commissions, and cashouts.</p>
        </div>
        <span className="text-xs font-bold px-3 py-1 bg-slate-950 text-slate-400 rounded-xl border border-slate-800">
          Recent Activity
        </span>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <th className="py-3 px-5">Type / Description</th>
              <th className="py-3 px-5">Date</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
            {safeList.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-slate-500 text-xs">
                  No transaction history recorded yet.
                </td>
              </tr>
            ) : (
              safeList.map((tx, index) => {
                const txType = tx.type || 'task_completion';
                const txStatus = tx.status || 'completed';
                const amountNum = isNaN(Number(tx.amount)) ? 0 : Number(tx.amount);
                
                const rowKey = tx._uniqueKey || `tx-${tx.id || 'item'}-${index}`;

                return (
                  <tr key={rowKey} className="hover:bg-slate-800/40 transition">
                    
                    {/* Type & Icon */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                          txType === 'referral_bonus' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : txType === 'withdrawal'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {txType === 'referral_bonus' ? (
                            <Gift className="w-4 h-4" />
                          ) : txType === 'withdrawal' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-200 block leading-tight">
                            {tx.description || 'Task Activity'}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {txType.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-5 text-slate-400 text-xs font-medium">
                      {tx.date || 'Recently'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        txStatus === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {txStatus === 'completed' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span className="capitalize">{txStatus}</span>
                      </span>
                    </td>

                    {/* Amount */}
                    <td className={`py-3.5 px-5 text-right font-black ${
                      txType === 'withdrawal' ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {txType === 'withdrawal' ? '-' : '+'}${amountNum.toFixed(2)}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
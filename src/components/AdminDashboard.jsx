// src/components/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ArrowLeft, 
  PlusCircle, 
  Wallet, 
  Users, 
  DollarSign,
  ArrowDown,
  ExternalLink
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const INITIAL_TASK_STATE = {
  title: '',
  description: '',
  reward: '',
  category: 'social',
  link: '',
  slots: 100,
  durationHours: 24
};

export default function AdminDashboard({ onBackToSite, onOpenCreateCampaign }) {
  const [submissions, setSubmissions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [deposits, setDeposits] = useState([]);
  
  // Tabs: 'tasks' | 'withdrawals' | 'deposits'
  const [activeTab, setActiveTab] = useState('tasks');
  const [withdrawalFilter, setWithdrawalFilter] = useState('pending');
  const [depositFilter, setDepositFilter] = useState('pending');
  const [isLoadingTask, setIsLoadingTask] = useState(false);

  // Notification Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [taskData, setTaskData] = useState(INITIAL_TASK_STATE);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    const timer = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch Submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setSubmissions(data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setSubmissions([]);
    }
  }, []);

  // Fetch Withdrawals
  const fetchWithdrawals = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setWithdrawals(data);
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      setWithdrawals([]);
    }
  }, []);

  // Fetch Deposits
  const fetchDeposits = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/deposits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setDeposits(data);
    } catch (err) {
      console.error('Error fetching deposits:', err);
      setDeposits([]);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
    fetchWithdrawals();
    fetchDeposits();
  }, [fetchSubmissions, fetchWithdrawals, fetchDeposits]);

  const handleVerify = async (submissionId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/submissions/${submissionId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Action failed');

      showToast(data.message || `Submission ${action}d successfully!`, 'success');
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      showToast(`Verification failed: ${err.message}`, 'error');
    }
  };

  const handleWithdrawalAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/withdrawals/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Action failed');

      showToast(data.message || `Withdrawal ${action}ed successfully!`, 'success');
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
      showToast(`Error processing withdrawal: ${err.message}`, 'error');
    }
  };

  const handleDepositAction = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/deposits/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Action failed');

      showToast(data.message || `Deposit ${action}ed successfully!`, 'success');
      fetchDeposits();
    } catch (err) {
      console.error(err);
      showToast(`Error processing deposit: ${err.message}`, 'error');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsLoadingTask(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...taskData,
          reward: parseFloat(taskData.reward) || 0
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create task');

      showToast('Task published successfully!', 'success');
      setTaskData(INITIAL_TASK_STATE);
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setIsLoadingTask(false);
    }
  };

  // Safe Guarded Array Filtering to Prevent Render Crashes
  const pendingSubmissions = Array.isArray(submissions) ? submissions.filter((s) => s.status === 'pending') : [];
  const pendingWithdrawalsCount = Array.isArray(withdrawals) ? withdrawals.filter((w) => w.status === 'pending').length : 0;
  const pendingDepositsCount = Array.isArray(deposits) ? deposits.filter((d) => d.status === 'pending').length : 0;

  const filteredWithdrawals = Array.isArray(withdrawals) ? withdrawals.filter((w) => {
    if (withdrawalFilter === 'all') return true;
    return w.status === withdrawalFilter;
  }) : [];

  const filteredDeposits = Array.isArray(deposits) ? deposits.filter((d) => {
    if (depositFilter === 'all') return true;
    return d.status === depositFilter;
  }) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 font-sans relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-300 border-rose-800'
                : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black text-white">Admin Operations Panel</h1>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Live
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review payout requests, approve wallet deposits, verify proof of work, and release task slots.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenCreateCampaign && (
            <button
              type="button"
              onClick={onOpenCreateCampaign}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Advertiser Campaign</span>
            </button>
          )}
          {onBackToSite && (
            <button
              type="button"
              onClick={onBackToSite}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* POST TASK FORM */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl h-fit">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Post New Task</h2>
              <p className="text-xs text-slate-400">Configure parameters, slot capacity, and completion duration</p>
            </div>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                Task Title
              </label>
              <input
                id="title"
                type="text"
                value={taskData.title}
                onChange={(e) => setTaskData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Subscribe & Like YouTube Video"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="reward" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Reward ($)
                </label>
                <input
                  id="reward"
                  type="number"
                  step="0.01"
                  min="0"
                  value={taskData.reward}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, reward: e.target.value }))}
                  placeholder="0.50"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none transition"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={taskData.category}
                  onChange={(e) => setTaskData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none capitalize transition cursor-pointer"
                >
                  {['social', 'app_test', 'engagement', 'surveys'].map((c) => (
                    <option key={`admin-cat-${c}`} value={c}>
                      {c.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="slots" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Available Slots
                </label>
                <input
                  id="slots"
                  type="number"
                  min="1"
                  value={taskData.slots}
                  onChange={(e) =>
                    setTaskData((prev) => ({ ...prev, slots: parseInt(e.target.value, 10) || 0 }))
                  }
                  placeholder="100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none transition"
                  required
                />
              </div>
              <div>
                <label htmlFor="durationHours" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                  Timer Limit (Hours)
                </label>
                <input
                  id="durationHours"
                  type="number"
                  min="1"
                  value={taskData.durationHours}
                  onChange={(e) =>
                    setTaskData((prev) => ({ ...prev, durationHours: parseInt(e.target.value, 10) || 24 }))
                  }
                  placeholder="24"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="link" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                Task Target Link
              </label>
              <input
                id="link"
                type="url"
                value={taskData.link}
                onChange={(e) => setTaskData((prev) => ({ ...prev, link: e.target.value }))}
                placeholder="https://example.com/target-link"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-slate-300 font-bold uppercase tracking-wider text-[10px] mb-1">
                Task Instructions
              </label>
              <textarea
                id="description"
                value={taskData.description}
                onChange={(e) => setTaskData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Explain the required steps to complete this micro-task..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:border-emerald-500 outline-none resize-none transition"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={isLoadingTask}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black py-3 rounded-xl transition shadow-lg shadow-emerald-500/10 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoadingTask ? 'Publishing...' : 'Publish Task'}
            </button>
          </form>
        </div>

        {/* VERIFICATION, DEPOSITS & PAYOUT QUEUE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'tasks'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Proofs ({pendingSubmissions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('deposits')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'deposits'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Deposits ({pendingDepositsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('withdrawals')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'withdrawals'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Payouts ({pendingWithdrawalsCount})
                </button>
              </div>

              {/* Status filter pill for cashout tab */}
              {activeTab === 'withdrawals' && (
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {['pending', 'completed', 'rejected', 'all'].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setWithdrawalFilter(status)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition cursor-pointer ${
                        withdrawalFilter === status
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}

              {/* Status filter pill for deposits tab */}
              {activeTab === 'deposits' && (
                <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {['pending', 'completed', 'rejected', 'all'].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setDepositFilter(status)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition cursor-pointer ${
                        depositFilter === status
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TAB 1: TASK PROOFS */}
            {activeTab === 'tasks' && (
              pendingSubmissions.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-semibold">No pending task proofs to review.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 scrollbar-none">
                  {pendingSubmissions.map((sub) => (
                    <div
                      key={`admin-sub-${sub.id}`}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">{sub.task_title || 'Untitled Task'}</p>
                          <p className="text-xs text-slate-400">
                            Submitted by:{' '}
                            <span className="text-emerald-400 font-medium">
                              {sub.user_name || sub.user_email || `User #${sub.user_id}`}
                            </span>
                          </p>
                        </div>
                        <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                          +${parseFloat(sub.reward || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                        <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                          Submitted Proof Payload
                        </p>
                        <p className="text-xs font-mono text-slate-200 break-all">{sub.proof}</p>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleVerify(sub.id, 'approve')}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                        >
                          Approve & Pay User
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerify(sub.id, 'reject')}
                          className="flex-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                        >
                          Reject Proof
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* TAB 2: DEPOSITS */}
            {activeTab === 'deposits' && (
              filteredDeposits.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                  <ArrowDown className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-semibold">
                    No {depositFilter !== 'all' ? depositFilter : ''} deposit requests found.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 scrollbar-none">
                  {filteredDeposits.map((d) => {
                    const depositAmount = parseFloat(d.amount || 0);
                    const refCode = d.reference || d.reference_id || d.proof || 'N/A';

                    return (
                      <div
                        key={`admin-deposit-${d.id}`}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-white">
                              {d.user_name || d.user_email || `User #${d.user_id}`}
                            </p>
                            <p className="text-xs text-slate-400">
                              Payment Method:{' '}
                              <span className="text-white font-semibold">
                                {d.method || d.payment_method || 'Manual Deposit'}
                              </span>
                            </p>
                          </div>
                          <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                            +${depositAmount.toFixed(2)}
                          </span>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-500">Transaction Ref / Proof Payload</p>
                          <p className="text-xs font-mono text-amber-400 font-bold break-all">
                            {refCode}
                          </p>
                        </div>

                        {d.status === 'pending' ? (
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleDepositAction(d.id, 'approve')}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                            >
                              Approve & Credit Balance
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDepositAction(d.id, 'reject')}
                              className="flex-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                            >
                              Reject Deposit
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`text-center py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                              d.status === 'completed' || d.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {d.status === 'completed' || d.status === 'approved' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Deposit Credited</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Deposit Rejected</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* TAB 3: PAYOUTS */}
            {activeTab === 'withdrawals' && (
              filteredWithdrawals.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl">
                  <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-semibold">
                    No {withdrawalFilter !== 'all' ? withdrawalFilter : ''} payout requests available.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1 scrollbar-none">
                  {filteredWithdrawals.map((w) => {
                    const grossAmount = parseFloat(w.amount || 0);
                    const feeAmount = w.fee !== undefined ? parseFloat(w.fee) : grossAmount * 0.25;
                    const netPayout = w.net_amount !== undefined ? parseFloat(w.net_amount) : grossAmount - feeAmount;
                    const userRefs = w.user_referrals !== undefined ? w.user_referrals : 0;

                    return (
                      <div
                        key={`admin-withdraw-${w.id}`}
                        className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-bold text-white">
                              {w.user_name || w.user_email || `User #${w.user_id}`}
                            </p>
                            <p className="text-xs text-slate-400">
                              Method:{' '}
                              <span className="text-white font-semibold">
                                {w.payment_method || w.method || 'Bank Transfer'}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl block">
                              ${grossAmount.toFixed(2)} Gross
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-1">
                          <p className="text-[10px] uppercase font-bold text-slate-500">Destination Account</p>
                          <p className="text-xs font-mono text-emerald-400 font-bold break-all">
                            {w.account_details || w.description || 'No account details provided'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                          <div>
                            <span className="text-slate-400 block">Net Payout (75%):</span>
                            <span className="font-extrabold text-emerald-400">${netPayout.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Fee (25% Admin):</span>
                            <span className="font-semibold text-amber-400">${feeAmount.toFixed(2)}</span>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-500" /> Referrals Check:
                            </span>
                            <span
                              className={`font-bold ${
                                userRefs >= 3 ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {userRefs} / 3 Completed
                            </span>
                          </div>
                        </div>

                        {w.status === 'pending' ? (
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleWithdrawalAction(w.id, 'approve')}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                            >
                              Approve & Pay Out
                            </button>
                            <button
                              type="button"
                              onClick={() => handleWithdrawalAction(w.id, 'reject')}
                              className="flex-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`text-center py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                              w.status === 'completed' || w.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {w.status === 'completed' || w.status === 'approved' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approved & Released</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rejected & Refunded</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
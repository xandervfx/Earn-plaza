// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import DepositModal from './components/DepositModal';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import TransactionLedger from './components/TransactionLedger';
import WithdrawalModal from './components/WithdrawalModal';
import AuthModal from './components/AuthModal';
import AdminModal from './components/AdminModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import AdvertiserCampaign from './components/AdvertiserCampaign';
import ReferralCard from './components/ReferralCard';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0.00);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(window.location.hash === '#admin');
  const [isAdvertiserView, setIsAdvertiserView] = useState(window.location.hash === '#advertiser');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Notification Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Modals state
  const [activeTask, setActiveTask] = useState(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);

  // Toast Trigger Helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Sync hash routing for admin and advertiser views
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin');
      setIsAdvertiserView(window.location.hash === '#advertiser');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch transaction history for authenticated user
  const fetchTransactions = useCallback(async (userId) => {
    const id = userId || user?.id || user?.user_id;
    if (!id) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:5000/api/user/earnings-history/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const historyData = await res.json();

      if (Array.isArray(historyData)) {
        const formattedHistory = historyData.map((item, idx) => ({
          ...item,
          _uniqueKey: `tx-${item.id || item.transaction_id || 'item'}-${idx}`
        }));
        setTransactions(formattedHistory);
      }
    } catch (err) {
      console.warn('Transaction history notice:', err.message);
    }
  }, [user?.id, user?.user_id]);

  // Restore user session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => {
          if (!res.ok) throw new Error('Token expired or invalid');
          return res.json();
        })
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setBalance(Number(data.user.balance) || 0.00);
            
            const userId = data.user.id || data.user.user_id;
            if (userId) {
              fetchTransactions(userId);
            }
          }
        })
        .catch((err) => {
          console.warn('Session restore failed:', err.message);
          localStorage.removeItem('token');
        });
    }
  }, [fetchTransactions]);

  // Fetch live tasks safely
  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await fetch('http://localhost:5000/api/tasks', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });

        const data = await res.json();

        if (isMounted && res.ok && Array.isArray(data)) {
          const uniqueTasks = data.filter((task, index, self) =>
            index === self.findIndex((t) => (t.id || index) === (task.id || index))
          );
          setTasks(uniqueTasks);
        }
      } catch (err) {
        console.error('Failed to load tasks:', err);
      }
    };

    fetchTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handler for adding newly created task to state
  const handleTaskCreated = (newTask) => {
    if (newTask) {
      setTasks((prev) => [newTask, ...prev]);
      showToast('New campaign created successfully!', 'success');
    }
  };

  // Handle Cashout Request Sync
  const handleWithdrawSuccess = async ({ amount, method, accountDetails }) => {
    if (!user) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5000/api/withdrawals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          paymentMethod: method,
          accountDetails: accountDetails,
        }),
      });

      const responseText = await res.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        throw new Error("Server returned an invalid response.");
      }

      if (!res.ok) {
        throw new Error(data.error || 'Withdrawal request failed.');
      }

      setBalance((prev) => Math.max(0, prev - amount));
      const userId = user.id || user.user_id;
      if (userId) fetchTransactions(userId);
      showToast('Withdrawal request submitted successfully!', 'success');
      setIsWithdrawOpen(false);

    } catch (err) {
      console.error('Failed to withdraw:', err);
      showToast(`Error: ${err.message}`, 'error');
    }
  };
  

  // Auth Handlers
  const handleLoginSuccess = (userData, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    setUser(userData);
    setBalance(Number(userData.balance) || 0.00);
    
    const userId = userData.id || userData.user_id;
    if (userId) {
      fetchTransactions(userId);
    }
    showToast(`Welcome back, ${userData.name || 'User'}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setBalance(0.00);
    setTransactions([]);
    localStorage.removeItem('token');
    showToast('Logged out successfully.', 'success');
  };

  // Filter tasks based on active category selection
  const filteredTasks = selectedCategory === 'all'
    ? tasks
    : tasks.filter(task => (task.category || '').toLowerCase() === selectedCategory.toLowerCase());

  // Dedicated Admin Hash View (#admin)
  if (isAdminView) {
    return (
      <AdminDashboard
        onBackToSite={() => {
          window.location.hash = '';
        }}
        onOpenCreateCampaign={() => {
          window.location.hash = '#advertiser';
        }}
      />
    );
  }

  // Dedicated Advertiser Campaign View (#advertiser)
  if (isAdvertiserView) {
    return (
      <AdvertiserCampaign
        user={user}
        onBackToSite={() => {
          window.location.hash = '';
        }}
        onCampaignCreated={(newCampaign) => {
          if (newCampaign) {
            handleTaskCreated(newCampaign);
          }
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased font-sans relative pb-12">
      
      {/* Dynamic Toast Feedback Banner */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold ${
            toast.type === 'error' 
              ? 'bg-rose-950/90 text-rose-300 border-rose-800' 
              : 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {!user ? (
        <LandingPage 
          onOpenLogin={() => setIsAuthOpen(true)}
          onOpenRegister={() => setIsAuthOpen(true)}
        />
      ) : (
        <>
          <Header
            user={user}
            balance={balance}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenDeposit={() => setIsDepositOpen(true)} // <--- ADD THIS
            onOpenAdvertiser={() => { window.location.hash = '#advertiser'; }}
            onLogout={handleLogout}
          />

          <main className="max-w-6xl mx-auto px-4 py-8">
            <HeroBanner user={user || { name: 'Guest' }} />

            {/* Referral Banner */}
            <ReferralCard user={user} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-10">
              <div>
                <h3 className="text-xl font-black text-white">Active Task Queue</h3>
                <p className="text-xs text-slate-400">Select a micro-task below to complete and earn instantly.</p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => { window.location.hash = '#advertiser'; }}
                  className="text-xs font-bold px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  + Create Campaign
                </button>
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setIsAdminOpen(true)}
                    className="text-xs font-bold px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition border border-slate-700 cursor-pointer"
                  >
                    + Post Task (Admin)
                  </button>
                )}
                <span className="text-xs font-bold px-3 py-1.5 bg-slate-900 border border-slate-800 text-emerald-400 rounded-xl">
                  {filteredTasks.length} Available
                </span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-2 my-4 overflow-x-auto pb-2 scrollbar-none">
              {['all', 'social', 'app_test', 'engagement', 'surveys'].map((cat, idx) => (
                <button
                  key={`cat-pill-${cat}-${idx}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                    selectedCategory === cat 
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTasks.map((task, index) => (
                <TaskCard 
                  key={`main-task-card-${task.id || 'no-id'}-${index}`} 
                  task={task} 
                  onClick={() => setActiveTask(task)} 
                />
              ))}
            </div>

            {/* Unified Transaction & Earnings Ledger */}
            <div className="mt-10">
              <TransactionLedger 
                transactions={transactions} 
              />
            </div>
          </main>
        </>
      )}

      {/* MODALS */}
      {activeTask && (
        <TaskModal 
          task={activeTask} 
          onClose={() => setActiveTask(null)} 
          onSubmitSuccess={(task, proof) => {
            const token = localStorage.getItem('token');
            const targetTaskId = task.id || task.task_id || task._id;
            const currentUserId = user?.id || user?.user_id;

            const submissionPayload = {
              taskId: targetTaskId,
              task_id: targetTaskId,
              proof: proof,
              proofUrl: proof,
              proof_data: proof,
              userId: currentUserId,
              user_id: currentUserId
            };

            fetch('http://localhost:5000/api/tasks/submit', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(submissionPayload)
            })
              .then(async (res) => {
                const data = await res.json();
                if (!res.ok || data.error) {
                  throw new Error(data.error || data.message || 'Submission failed');
                }
                return data;
              })
              .then(data => {
                showToast(data.message || 'Proof submitted successfully for verification!', 'success');
                if (currentUserId) fetchTransactions(currentUserId);
                setTasks(prev => prev.filter(t => (t.id || t.task_id) !== targetTaskId));
                setActiveTask(null);
              })
              .catch(err => {
                console.error('Task submission error:', err);
                showToast(`Submission Error: ${err.message}`, 'error');
              });
          }}
        />
      )}

      {isWithdrawOpen && (
        <WithdrawalModal
          user={user}
          balance={balance}
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          onWithdrawSuccess={handleWithdrawSuccess}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenForgotPassword={() => {
          setIsAuthOpen(false);
          setIsForgotPasswordOpen(true);
        }}
      />

      {/* MODALS */}
<DepositModal
  isOpen={isDepositOpen}
  onClose={() => setIsDepositOpen(false)}
/>

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSwitchToLogin={() => setIsAuthOpen(true)}
      />
    </div>
  );
}
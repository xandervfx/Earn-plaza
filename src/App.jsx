
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
import ProfileModal from './components/ProfileModal';
import ContactSupport from './components/ContactSupport';
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { API_BASE } from './components/config';

const getCurrentRoute = () => {
  const route = window.location.hash.replace(/^#/, '');

  if (route === 'vfx-adminmajor363') return 'admin';
  if (route === 'vfx-advertiser') return 'advertiser';

  return route;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [currentRoute, setCurrentRoute] = useState(getCurrentRoute);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const [activeTask, setActiveTask] = useState(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({
        show: false,
        message: '',
        type: 'success'
      });
    }, 4000);
  };

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getCurrentRoute());
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const privateRoutes = ['deposit', 'withdraw', 'profile'];

    if (privateRoutes.includes(currentRoute) && !user) {
      setIsAuthOpen(true);
    }
  }, [currentRoute, user]);

  const goToDashboard = () => {
    window.location.hash = '';
  };

  const fetchTransactions = useCallback(async (userId) => {
    const id = userId || user?.id || user?.user_id;

    if (!id) return;

    const token = localStorage.getItem('token');

    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE}/api/user/earnings-history/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const historyData = await res.json();

      if (Array.isArray(historyData)) {
        const formattedHistory = historyData.map((item, index) => ({
          ...item,
          _uniqueKey: `tx-${item.id || item.transaction_id || 'item'}-${index}`
        }));

        setTransactions(formattedHistory);
      }
    } catch (err) {
      console.warn('Transaction history notice:', err.message);
    }
  }, [user?.id, user?.user_id]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Token expired or invalid');
        }

        const data = await res.json();

        if (cancelled) return;

        if (data.user) {
          setUser(data.user);
          setBalance(Number(data.user.balance) || 0);

          const userId = data.user.id || data.user.user_id;

          if (userId) {
            fetchTransactions(userId);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Session restore failed:', err.message);
          localStorage.removeItem('token');
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [fetchTransactions]);

  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async () => {
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`${API_BASE}/api/tasks`, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {}
        });

        const data = await res.json();

        if (isMounted && res.ok && Array.isArray(data)) {
          const seen = new Set();

          const uniqueTasks = data.filter((task, index) => {
            const id = task.id || task.task_id || task._id || `task-${index}`;

            if (seen.has(id)) return false;

            seen.add(id);
            return true;
          });

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

  const handleTaskCreated = (newTask) => {
    if (newTask) {
      setTasks((previousTasks) => [newTask, ...previousTasks]);
      showToast('New campaign created successfully!', 'success');
    }
  };

  const handleWithdrawSuccess = async ({
    amount,
    method,
    accountDetails
  }) => {
    if (!user) {
      throw new Error('Please sign in before requesting a withdrawal.');
    }

    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('Your session has expired. Please sign in again.');
    }

    try {
      const res = await fetch(`${API_BASE}/api/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          paymentMethod: method,
          accountDetails
        })
      });

      const responseText = await res.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error('The server returned an invalid response.');
      }

      if (!res.ok) {
        throw new Error(
          data.error || data.message || 'Withdrawal request failed.'
        );
      }

      setBalance((previousBalance) =>
        Math.max(0, previousBalance - Number(amount))
      );

      const userId = user.id || user.user_id;

      if (userId) {
        fetchTransactions(userId);
      }

      showToast('Withdrawal request submitted successfully!', 'success');
      setIsWithdrawOpen(false);

      return data;
    } catch (err) {
      console.error('Failed to withdraw:', err);
      showToast(`Error: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleLoginSuccess = (userData, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }

    setUser(userData);
    setBalance(Number(userData.balance) || 0);

    const userId = userData.id || userData.user_id;

    if (userId) {
      fetchTransactions(userId);
    }

    setIsAuthOpen(false);
    showToast(`Welcome back, ${userData.name || 'User'}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setBalance(0);
    setTransactions([]);
    setIsProfileOpen(false);
    setIsWithdrawOpen(false);
    setIsDepositOpen(false);
    localStorage.removeItem('token');

    goToDashboard();
    showToast('Logged out successfully.', 'success');
  };

  const handleProfileUpdated = (updatedProfile) => {
    setUser((previousUser) => {
      if (!previousUser) return previousUser;

      return {
        ...previousUser,
        ...updatedProfile
      };
    });

    if (updatedProfile.balance !== undefined) {
      setBalance(Number(updatedProfile.balance) || 0);
    }

    showToast('Profile updated successfully!', 'success');
  };

  const filteredTasks = selectedCategory === 'all'
    ? tasks
    : tasks.filter(
        (task) =>
          (task.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );

  const toastBanner = toast.show ? (
    <div className="fixed bottom-5 right-5 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold ${
          toast.type === 'error'
            ? 'bg-rose-950/95 text-rose-300 border-rose-800'
            : 'bg-emerald-950/95 text-emerald-300 border-emerald-800'
        }`}
      >
        {toast.type === 'error'
          ? <AlertCircle className="w-4 h-4 shrink-0" />
          : <CheckCircle2 className="w-4 h-4 shrink-0" />}
        <span>{toast.message}</span>
      </div>
    </div>
  ) : null;

  // Admin route: #admin
  if (currentRoute === 'admin') {
    return (
      <AdminDashboard
        onBackToSite={goToDashboard}
        onOpenCreateCampaign={() => {
          window.location.hash = '#advertiser';
        }}
      />
    );
  }

  // Advertiser route: #advertiser
  if (currentRoute === 'advertiser') {
    return (
      <AdvertiserCampaign
        user={user}
        onBackToSite={goToDashboard}
        onCampaignCreated={(newCampaign) => {
          if (newCampaign) {
            handleTaskCreated(newCampaign);
          }

          goToDashboard();
        }}
      />
    );
  }

  // Dedicated Contact & Support page: #support
  if (currentRoute === 'support') {
    return (
      <div className="min-h-screen bg-slate-950 text-white antialiased">
        {toastBanner}
        <ContactSupport onBack={goToDashboard} />
      </div>
    );
  }

  // Dedicated deposit page: #deposit
  if (currentRoute === 'deposit' && user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white antialiased">
        {toastBanner}
        <DepositModal
          standalone
          user={user}
          onSuccess={() => {
            showToast(
              'Deposit request submitted. Your account will be credited after verification.',
              'success'
            );
          }}
        />
      </div>
    );
  }

  // Dedicated withdrawal page: #withdraw
  if (currentRoute === 'withdraw' && user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white antialiased">
        {toastBanner}
        <WithdrawalModal
          standalone
          user={user}
          balance={balance}
          onWithdrawSuccess={handleWithdrawSuccess}
        />
      </div>
    );
  }

  // Dedicated profile page: #profile
  if (currentRoute === 'profile' && user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white antialiased">
        {toastBanner}
        <ProfileModal
          standalone
          user={user}
          onProfileUpdated={handleProfileUpdated}
        />
      </div>
    );
  }

  // Dedicated Terms & Conditions page: #terms
  if (currentRoute === 'terms') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 antialiased">
        {toastBanner}

        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              type="button"
              onClick={goToDashboard}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 transition"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white">
                  Terms & Conditions
                </h1>
                <p className="text-xs text-slate-500">Earn Plaza</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <div className="mb-8 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-bold text-white mb-2">
                  Welcome to Earn Plaza
                </h2>
                <p className="text-sm leading-7 text-slate-300">
                  These terms explain the basic rules for using Earn Plaza.
                  By creating an account or using the platform, you agree to
                  follow these rules. Please read them carefully.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-7">
            <section>
              <h2 className="text-base font-bold text-white mb-2">
                1. Your Account
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Provide accurate information when registering and keep your
                login details secure. You are responsible for activity carried
                out through your account. Do not impersonate another person or
                create accounts to manipulate rewards or referrals.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">
                2. Tasks and Rewards
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Complete tasks according to their displayed instructions and
                submit genuine proof when requested. Submissions may be
                reviewed before rewards are approved. False proof, duplicate
                submissions, automated abuse, or attempts to manipulate the
                platform may result in rejected submissions or account
                restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">
                3. Deposits and Verification
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Follow the deposit instructions displayed on the platform and
                submit accurate payment references and proof. A submitted
                deposit request is not the same as a confirmed deposit.
                Deposits remain pending until the required verification is
                completed. Never submit payment details or proof that belong
                to someone else without authorization.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">
                4. Withdrawals
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Withdrawal requests are subject to the eligibility conditions,
                minimum amount, available balance, referral requirements, and
                any applicable fee displayed by Earn Plaza. Check the net
                payout shown before submitting a request. Enter correct payout
                details. Requests may require review and are not guaranteed
                to be completed immediately.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">
                5. Referrals and Campaigns
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Use genuine referral and campaign activity. Do not spam,
                mislead other users, fabricate engagement, or promise returns
                that Earn Plaza has not explicitly confirmed. Campaigns and
                tasks may have additional instructions that must also be
                followed.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">
                6. Prohibited Activity
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Fraud, unauthorized access, exploitation of bugs, interference
                with platform operations, and misuse of another user's
                information are prohibited. We may investigate suspicious
                activity and restrict affected features or accounts where
                appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">
                7. Platform Availability
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Features, tasks, and services may change or become temporarily
                unavailable for maintenance, security, or operational reasons.
                Earnings are not guaranteed; rewards depend on available tasks,
                their conditions, and successful verification.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">
                8. Privacy and Security
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Use the platform responsibly and only provide information
                needed for your account and transactions. Do not share your
                password or authentication token. Contact the platform
                administrator if you suspect unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">
                9. Changes to These Terms
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                These terms may be updated as the platform develops. Updated
                terms should be published on this page. Continued use after
                an update means you accept the revised terms where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2">
                10. Questions and Support
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                For questions about an account, task, deposit, or withdrawal,
                open the Contact & Support page. Keep your transaction
                references so the relevant request can be reviewed.
              </p>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#support';
                }}
                className="mt-3 px-4 py-2 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-sm font-semibold transition"
              >
                Contact Support
              </button>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Please review these terms before using the platform.
            </p>
            <button
              type="button"
              onClick={goToDashboard}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition"
            >
              Back to Earn Plaza
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased font-sans relative pb-12">
      {toastBanner}

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
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenAdvertiser={() => {
              window.location.hash = '#advertiser';
            }}
            onOpenSupport={() => {
              window.location.hash = '#support';
            }}
            onLogout={handleLogout}
          />

          <main className="max-w-6xl mx-auto px-4 py-8">
            <HeroBanner user={user} />

            <ReferralCard user={user} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-10">
              <div>
                <h3 className="text-xl font-black text-white">
                  Active Task Queue
                </h3>
                <p className="text-xs text-slate-400">
                  Select a micro-task below to complete and earn instantly.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#advertiser';
                  }}
                  className="text-xs font-bold px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition shadow-lg shadow-emerald-500/10"
                >
                  + Create Campaign
                </button>

                {user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setIsAdminOpen(true)}
                    className="text-xs font-bold px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition border border-slate-700"
                  >
                    + Post Task (Admin)
                  </button>
                )}

                <span className="text-xs font-bold px-3 py-1.5 bg-slate-900 border border-slate-800 text-emerald-400 rounded-xl">
                  {filteredTasks.length} Available
                </span>
              </div>
            </div>

            <div className="flex gap-2 my-4 overflow-x-auto pb-2 scrollbar-none">
              {['all', 'social', 'app_test', 'engagement', 'surveys'].map(
                (category) => (
                  <button
                    key={`cat-pill-${category}`}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                      selectedCategory === category
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {category.replace('_', ' ')}
                  </button>
                )
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTasks.map((task, index) => (
                <TaskCard
                  key={`main-task-card-${task.id || task.task_id || 'no-id'}-${index}`}
                  task={task}
                  onClick={() => setActiveTask(task)}
                />
              ))}
            </div>

            <div className="mt-10">
              <TransactionLedger transactions={transactions} />
            </div>
          </main>
        </>
      )}

      {activeTask && user && (
        <TaskModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onSubmitSuccess={(task, proof) => {
            const token = localStorage.getItem('token');
            const targetTaskId = task.id || task.task_id || task._id;
            const currentUserId = user.id || user.user_id;

            const submissionPayload = {
              taskId: targetTaskId,
              task_id: targetTaskId,
              proof,
              proofUrl: proof,
              proof_data: proof,
              userId: currentUserId,
              user_id: currentUserId
            };

            fetch(`${API_BASE}/api/tasks/submit`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(submissionPayload)
            })
              .then(async (res) => {
                const data = await res.json();

                if (!res.ok || data.error) {
                  throw new Error(
                    data.error || data.message || 'Submission failed'
                  );
                }

                return data;
              })
              .then((data) => {
                showToast(
                  data.message ||
                    'Proof submitted successfully for verification!',
                  'success'
                );

                if (currentUserId) {
                  fetchTransactions(currentUserId);
                }

                setTasks((previousTasks) =>
                  previousTasks.filter(
                    (item) =>
                      (item.id || item.task_id || item._id) !== targetTaskId
                  )
                );

                setActiveTask(null);
              })
              .catch((err) => {
                console.error('Task submission error:', err);
                showToast(`Submission Error: ${err.message}`, 'error');
              });
          }}
        />
      )}

      {isWithdrawOpen && user && (
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

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={() => {
          showToast(
            'Deposit request submitted. Your account will be credited after verification.',
            'success'
          );
        }}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSwitchToLogin={() => {
          setIsForgotPasswordOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onProfileUpdated={handleProfileUpdated}
      />
    </div>
  );
}

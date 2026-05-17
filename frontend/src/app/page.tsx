'use client';

import { useStore } from "@/store/useStore";
import { Play, Wallet, Users, History, Gift, Timer, ExternalLink, CheckCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/api/axios";
import { motion } from "framer-motion";

export default function Home() {
  const { user, updateBalance } = useStore();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [stats, setStats] = useState<any>(null);

  // Native Sponsor Tasks State
  const [tasks, setTasks] = useState<any[]>([
    {
      id: 1,
      title: "Join Telegram Sponsor",
      desc: "Join our official news channel for updates.",
      reward: 0.05,
      link: "https://t.me/wfjcikcnfhcdbcbot",
      status: "GO", // GO, VERIFYING, CLAIM, DONE
      timer: 0
    },
    {
      id: 2,
      title: "Play Ton Boost Mini-App",
      desc: "Launch the partner mini app and complete level 1.",
      reward: 0.08,
      link: "https://t.me/your_bot",
      status: "GO",
      timer: 0
    },
    {
      id: 3,
      title: "Subscribe to YouTube Channel",
      desc: "Subscribe to our partner channel for tech tips.",
      reward: 0.04,
      link: "https://youtube.com",
      status: "GO",
      timer: 0
    }
  ]);

  useEffect(() => {
    fetchStats();

    // Automatically trigger In-App Interstitial on app mount safely
    if (typeof window !== 'undefined') {
      const triggerInApp = () => {
        const showAdFn = (window as any).show_11017565;
        if (typeof showAdFn === 'function') {
          try {
            showAdFn({
              type: 'inApp',
              inAppSettings: {
                frequency: 2,
                capping: 0.1,
                interval: 30,
                timeout: 5,
                everyPage: false
              }
            });
            console.log("In-App Interstitial successfully initialized!");
          } catch (e) {
            console.error("Failed to initialize In-App Interstitial:", e);
          }
        } else {
          // Retry in 1.5 seconds if script is still loading
          setTimeout(triggerInApp, 1500);
        }
      };
      triggerInApp();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/user/stats');
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWatchAd = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const showAdFn = (window as any).show_11017565;
        if (typeof showAdFn === 'function') {
          // 1. Trigger the Promise-based Rewarded Interstitial
          await showAdFn().then(async () => {
            // 2. User successfully watched ad! Award points on backend!
            const { data } = await api.post('/ad/reward');
            updateBalance(data.reward);
            setCooldown(15); // 15 seconds cooldown
            fetchStats();
            alert(`🎉 Success! You watched the ad and earned $${data.reward}`);
          }).catch((err: any) => {
            console.warn("User closed ad or error occurred:", err);
            alert("⚠️ You closed the ad early. Watch to the end to get rewarded.");
          });
        } else {
          // Fallback simulation in dev mode/if blocked
          console.warn("show_11017565 function not found. Simulating ad.");
          await new Promise(resolve => setTimeout(resolve, 3000));
          const { data } = await api.post('/ad/reward');
          updateBalance(data.reward);
          setCooldown(15);
          fetchStats();
          alert(`🎉 [Demo Mode] Success! You watched the ad and earned $${data.reward}`);
        }
      }
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Failed to claim reward. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'GO') {
      // Open sponsor link safely
      if (typeof window !== 'undefined') {
        const opened = (window as any).Telegram?.WebApp?.openLink 
          ? (window as any).Telegram.WebApp.openLink(task.link)
          : window.open(task.link, '_blank');
      }

      // Start Verification Timer (8 seconds)
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, status: 'VERIFYING', timer: 8 };
        }
        return t;
      }));

      const interval = setInterval(() => {
        setTasks(prev => {
          return prev.map(t => {
            if (t.id === taskId) {
              if (t.timer <= 1) {
                clearInterval(interval);
                return { ...t, status: 'CLAIM', timer: 0 };
              }
              return { ...t, timer: t.timer - 1 };
            }
            return t;
          });
        });
      }, 1000);

    } else if (task.status === 'CLAIM') {
      // Award reward and set to done
      updateBalance(task.reward);
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, status: 'DONE' };
        }
        return t;
      }));
      alert(`🎉 Reward Claimed! You earned $${task.reward} from Sponsor Task!`);
    }
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100">
          <div className="w-20 h-20 bg-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-200">
            <Play className="text-white w-10 h-10 fill-current" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Watch & Earn</h1>
          <p className="text-gray-500 mb-6">Please open this app via Telegram to start earning.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 pb-28 gap-6">
      {/* Header / Profile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="font-bold text-lg">@{user.username || 'User'}</h2>
            <p className="text-xs text-gray-500">ID: {user.telegramId}</p>
          </div>
        </div>
        <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-200">
          <Gift size={14} /> Daily Streak: 1
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="relative z-10">
          <p className="text-blue-100 text-sm font-medium mb-1 opacity-80 uppercase tracking-wider">Current Balance</p>
          <h1 className="text-5xl font-black mb-6 tracking-tight">${user.balance.toFixed(4)}</h1>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex-1">
              <p className="text-[10px] text-blue-100 uppercase font-bold opacity-70">Total Earned</p>
              <p className="text-lg font-bold">${stats?.totalEarned?.toFixed(4) || '0.0000'}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 flex-1">
              <p className="text-[10px] text-blue-100 uppercase font-bold opacity-70">Referrals</p>
              <p className="text-lg font-bold">{stats?.referralCount || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action - Rewarded Interstitial Ad */}
      <div className="flex flex-col gap-4">
        <button
          onClick={handleWatchAd}
          disabled={loading || cooldown > 0}
          className={`
            w-full h-20 rounded-[2rem] flex items-center justify-center gap-3 font-black text-xl transition-all shadow-xl
            ${(loading || cooldown > 0)
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-green-200'}
          `}
        >
          {loading ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : cooldown > 0 ? (
            <>
              <Timer className="w-6 h-6 animate-pulse" />
              Wait {cooldown}s
            </>
          ) : (
            <>
              <Play className="w-8 h-8 fill-current animate-bounce" />
              WATCH ADS & EARN
            </>
          )}
        </button>
        <div className="flex justify-between px-4 text-sm text-gray-500 font-medium">
          <span>Remaining: {stats?.dailyAdsRemaining || 0}/20</span>
          <span>Reward: $0.0020</span>
        </div>
      </div>

      {/* Featured Sponsor Tasks Section */}
      <div className="flex flex-col gap-3">
        <h3 className="font-black text-lg text-gray-800 ml-2">Featured Sponsor Tasks</h3>
        <div className="flex flex-col gap-3">
          {tasks.map(task => (
            <div key={task.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <h4 className="font-bold text-sm text-gray-800">{task.title}</h4>
                <p className="text-xs text-gray-400 leading-tight mb-2">{task.desc}</p>
                <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-green-100">
                  +${task.reward.toFixed(4)}
                </span>
              </div>
              <button
                onClick={() => handleTaskAction(task.id)}
                disabled={task.status === 'DONE' || (task.status === 'VERIFYING' && task.timer > 0)}
                className={`
                  px-5 py-3 rounded-2xl font-black text-xs transition-all shrink-0 active:scale-95 flex items-center gap-1
                  ${task.status === 'GO' && 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100'}
                  ${task.status === 'VERIFYING' && 'bg-yellow-100 text-yellow-700 border border-yellow-200 cursor-wait'}
                  ${task.status === 'CLAIM' && 'bg-green-500 text-white hover:bg-green-600 animate-bounce'}
                  ${task.status === 'DONE' && 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                {task.status === 'GO' && (
                  <>
                    GO <ExternalLink size={12} />
                  </>
                )}
                {task.status === 'VERIFYING' && (
                  <>
                    <RefreshCw size={12} className="animate-spin" /> {task.timer}s
                  </>
                )}
                {task.status === 'CLAIM' && "CLAIM"}
                {task.status === 'DONE' && (
                  <>
                    DONE <CheckCircle size={12} />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation - Floating */}
      <div className="fixed bottom-6 left-6 right-6 h-16 bg-white/80 backdrop-blur-lg border border-gray-100 rounded-[2rem] shadow-2xl flex items-center justify-around px-4">
        <NavIcon icon={<Play size={24} />} active label="Ads" />
        <NavIcon icon={<Users size={24} />} label="Friends" />
        <NavIcon icon={<Wallet size={24} />} label="Wallet" />
        <NavIcon icon={<History size={24} />} label="History" />
      </div>
    </div>
  );
}

function NavIcon({ icon, active, label }: { icon: any, active?: boolean, label: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${active ? 'text-blue-600 scale-110' : 'text-gray-400'} transition-all cursor-pointer`}>
      {icon}
      <span className="text-[8px] font-bold uppercase tracking-tighter">{label}</span>
    </div>
  );
}

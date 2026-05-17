'use client';

import { useStore } from "@/store/useStore";
import { Play, Wallet, Users, History, Gift, Timer } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/api/axios";
import { motion } from "framer-motion";

export default function Home() {
  const { user, updateBalance } = useStore();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
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
      // Simulate ad watch for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data } = await api.post('/ad/reward');
      updateBalance(data.reward);
      setCooldown(5); // 5 seconds cooldown
      fetchStats();
      alert(`Success! You earned $${data.reward}`);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to claim reward');
    } finally {
      setLoading(false);
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
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100"
        >
          <div className="w-20 h-20 bg-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-200">
            <Play className="text-white w-10 h-10 fill-current" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Watch & Earn</h1>
          <p className="text-gray-500 mb-6">Please open this app via Telegram to start earning.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 pb-24 gap-6">
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
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden"
      >
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
      </motion.div>

      {/* Main Action */}
      <div className="flex flex-col gap-4">
        <button
          onClick={handleWatchAd}
          disabled={loading || cooldown > 0}
          className={`
            w-full h-20 rounded-[2rem] flex items-center justify-center gap-3 font-black text-xl transition-all shadow-xl
            ${cooldown > 0 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-green-200'}
          `}
        >
          {loading ? (
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : cooldown > 0 ? (
            <>
              <Timer className="w-6 h-6" />
              Wait {cooldown}s
            </>
          ) : (
            <>
              <Play className="w-8 h-8 fill-current" />
              WATCH & EARN
            </>
          )}
        </button>
        <div className="flex justify-between px-4 text-sm text-gray-500 font-medium">
          <span>Remaining: {stats?.dailyAdsRemaining || 0}/20</span>
          <span>Reward: $0.0020</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-3">
            <Users size={24} />
          </div>
          <p className="font-bold text-sm">Refer Friends</p>
          <p className="text-[10px] text-gray-400">Earn 10% lifetime</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-3">
            <Wallet size={24} />
          </div>
          <p className="font-bold text-sm">Withdraw</p>
          <p className="text-[10px] text-gray-400">Min: $10.00</p>
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

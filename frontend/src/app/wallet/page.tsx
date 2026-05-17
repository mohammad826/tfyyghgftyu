'use client';

import { useStore } from "@/store/useStore";
import { ArrowLeft, Wallet, AlertCircle } from "lucide-react";
import { useState } from "react";
import api from "@/api/axios";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function WalletPage() {
  const { user } = useStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('TRC20 USDT');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleWithdraw = async () => {
    if (!amount || !address) return alert('Please fill all fields');
    if (parseFloat(amount) < 10) return alert('Minimum withdrawal is $10');

    setLoading(true);
    try {
      await api.post('/withdrawal/request', {
        amount: parseFloat(amount),
        method,
        walletAddress: address
      });
      alert('Withdrawal request submitted successfully!');
      router.push('/');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Header */}
      <div className="p-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Withdraw Funds</h1>
      </div>

      <div className="p-6 flex flex-col gap-8">
        {/* Balance Display */}
        <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
          <p className="text-blue-600 text-xs font-bold uppercase mb-1">Available for Withdrawal</p>
          <h2 className="text-4xl font-black text-blue-900">${user?.balance.toFixed(2)}</h2>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-2">Amount (USD)</label>
            <input
              type="number"
              placeholder="Min $10.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-16 bg-gray-50 border-none rounded-2xl px-6 font-bold text-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-2">Withdrawal Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full h-16 bg-gray-50 border-none rounded-2xl px-6 font-bold text-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>TRC20 USDT</option>
              <option>Binance UID</option>
              <option>Telegram Stars</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 ml-2">Wallet Address / ID</label>
            <input
              type="text"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-16 bg-gray-50 border-none rounded-2xl px-6 font-bold text-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-orange-50 p-4 rounded-2xl flex gap-3 border border-orange-100">
            <AlertCircle className="text-orange-500 shrink-0" size={20} />
            <p className="text-[10px] text-orange-700 leading-tight">
              Withdrawals are processed manually by our team within 24-48 hours. A $1.00 processing fee will be deducted from the total amount.
            </p>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-all mt-4"
          >
            {loading ? 'Processing...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

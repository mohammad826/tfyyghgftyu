'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import api from '../api/axios';
import { useStore } from '../store/useStore';

interface TelegramContextType {
  initDataRaw: string | undefined;
  initData: any | undefined;
}

const TelegramContext = createContext<TelegramContextType | null>(null);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [initDataRaw, setInitDataRaw] = useState<string>();
  const [initData, setInitData] = useState<any>();
  const { setUser, setToken } = useStore();

  useEffect(() => {
    try {
      // Retrieve launch parameters from Telegram SDK safely on the client side
      const { initDataRaw: raw, initData: parsed } = retrieveLaunchParams();
      
      // Fallback to window.Telegram if SDK retrieve fails or is empty
      const finalRaw = raw || (window as any).Telegram?.WebApp?.initData;
      
      setInitDataRaw(finalRaw);
      setInitData(parsed);

      if (finalRaw) {
        login(finalRaw);
      }
    } catch (e) {
      console.error('Failed to initialize Telegram SDK or retrieve launch params', e);
      
      // Fallback for development/testing outside Telegram
      const raw = (window as any).Telegram?.WebApp?.initData;
      if (raw) {
        setInitDataRaw(raw);
        login(raw);
      }
    }
  }, []);

  const login = async (raw: string) => {
    try {
      const { data } = await api.post('/auth/telegram', { initData: raw });
      // Ensure numeric types are normalized for the client
      const normalizedUser = {
        ...data.user,
        balance: typeof data.user.balance === 'string' ? parseFloat(data.user.balance) : Number(data.user.balance),
        telegramId: String(data.user.telegramId),
      };

      setToken(data.access_token);
      setUser(normalizedUser);
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  return (
    <TelegramContext.Provider value={{ initDataRaw, initData }}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) throw new Error('useTelegram must be used within TelegramProvider');
  return context;
};

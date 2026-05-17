'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  initInitData, 
  initMainButton, 
  initViewport, 
  initMiniApp, 
  useSignal,
  type InitData
} from '@telegram-apps/sdk-react';
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
      // Initialize Telegram SDK
      const viewport = initViewport();
      const miniApp = initMiniApp();
      const [initData] = initInitData();
      
      const raw = window.Telegram?.WebApp?.initData;
      setInitDataRaw(raw);
      setInitData(initData);

      if (raw) {
        login(raw);
      }
    } catch (e) {
      console.error('Failed to initialize Telegram SDK', e);
    }
  }, []);

  const login = async (raw: string) => {
    try {
      const { data } = await api.post('/auth/telegram', { initData: raw });
      setToken(data.access_token);
      setUser(data.user);
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

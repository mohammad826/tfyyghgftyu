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

function parseStartParam(initData: any): string | undefined {
  try {
    if (!initData?.startParam && initData?.user) {
      const hash = initData.hash;
      return undefined;
    }
    return initData?.startParam;
  } catch {
    return undefined;
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [initDataRaw, setInitDataRaw] = useState<string>();
  const [initData, setInitData] = useState<any>();
  const { setUser, setToken, isDarkMode, setDarkMode } = useStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else if (savedTheme === 'light') {
      setDarkMode(false);
    } else if (window.matchMedia) {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = useStore.subscribe(
      (state) => state.isDarkMode,
      (isDark) => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', isDark);
        }
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    try {
      const { initDataRaw: raw, initData: parsed } = retrieveLaunchParams();
      const finalRaw = raw || (window as any).Telegram?.WebApp?.initData;

      setInitDataRaw(finalRaw);
      setInitData(parsed);

      if (finalRaw) {
        const referralCode = parsed?.startParam || extractStartParamFromRaw(finalRaw);
        login(finalRaw, referralCode);
      }
    } catch (e) {
      console.error('Failed to initialize Telegram SDK', e);
      const raw = (window as any).Telegram?.WebApp?.initData;
      if (raw) {
        setInitDataRaw(raw);
        login(raw, extractStartParamFromRaw(raw));
      }
    }
  }, []);

  const login = async (initData: string, referralCode?: string) => {
    try {
      const payload: any = { initData };
      if (referralCode) {
        payload.referralCode = referralCode;
      }

      const { data } = await api.post('/auth/telegram', payload);

      const normalizedUser = {
        ...data.user,
        balance: typeof data.user.balance === 'string' ? parseFloat(data.user.balance) : Number(data.user.balance),
        telegramId: String(data.user.telegramId),
        streak: data.user.streak ?? 0,
        vipTier: data.user.vipTier ?? 0
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

function extractStartParamFromRaw(initDataRaw: string): string | undefined {
  try {
    const params = new URLSearchParams(initDataRaw);
    return params.get('start_param') || undefined;
  } catch {
    return undefined;
  }
}
import { create } from 'zustand';

interface User {
  id: string;
  telegramId: string;
  username: string;
  balance: number;
  isAdmin: boolean;
}

interface AppState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  updateBalance: (amount: number) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  updateBalance: (amount) => set((state) => ({
    user: state.user ? { ...state.user, balance: state.user.balance + amount } : null
  })),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

import { create } from 'zustand';
import axiosInstance from '../utils/axios';

interface User {
  id: number;
  phone: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('token', token || '');
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
    }
  }
})); 
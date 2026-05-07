import { create } from 'zustand';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  clearError: () => set({ error: null }),
  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (token && userData) {
        set({ user: JSON.parse(userData), token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      set({ isLoading: false });
    }
  },
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const res = await axios.post(BACKEND_URL + '/api/auth/login', { email, password });
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
    set({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
  },
  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    const res = await axios.post(BACKEND_URL + '/api/auth/register', { email, password, name });
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
    set({ user: res.data.user, token: res.data.token, isAuthenticated: true, isLoading: false });
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
